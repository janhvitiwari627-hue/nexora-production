
-- Extend wallet_transactions
ALTER TABLE public.wallet_transactions
  ADD COLUMN IF NOT EXISTS salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS wallet_id UUID REFERENCES public.salon_wallets(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_wallet_tx_salon_date ON public.wallet_transactions(salon_id, created_at DESC);

-- Extend salon_wallets
ALTER TABLE public.salon_wallets
  ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,4) DEFAULT 0.10,
  ADD COLUMN IF NOT EXISTS total_withdrawals NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_settlement_at TIMESTAMP WITH TIME ZONE;

-- Extend payments for escrow
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS escrow_release_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS released_to_wallet BOOLEAN DEFAULT false;

-- Set escrow_release_at automatically on successful advance payments
CREATE OR REPLACE FUNCTION public.set_payment_escrow()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'SUCCESS' AND NEW.escrow_release_at IS NULL THEN
    NEW.escrow_release_at := now() + INTERVAL '48 hours';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_set_payment_escrow ON public.payments;
CREATE TRIGGER trg_set_payment_escrow
BEFORE INSERT OR UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.set_payment_escrow();

-- Release one payment to salon wallet (deducts commission)
CREATE OR REPLACE FUNCTION public.release_payment_to_wallet(_payment_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p RECORD;
  w RECORD;
  commission NUMERIC(10,2);
  net_amount NUMERIC(10,2);
  new_balance NUMERIC(10,2);
BEGIN
  SELECT * INTO p FROM public.payments WHERE id = _payment_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Payment not found'; END IF;
  IF p.released_to_wallet THEN RETURN jsonb_build_object('already_released', true); END IF;
  IF p.status <> 'SUCCESS' THEN RAISE EXCEPTION 'Payment not in SUCCESS state'; END IF;
  IF p.salon_id IS NULL THEN RAISE EXCEPTION 'No salon_id on payment'; END IF;

  -- Ensure wallet exists
  INSERT INTO public.salon_wallets (salon_id) VALUES (p.salon_id)
    ON CONFLICT (salon_id) DO NOTHING;
  SELECT * INTO w FROM public.salon_wallets WHERE salon_id = p.salon_id FOR UPDATE;

  commission := ROUND(p.amount * COALESCE(w.commission_rate, 0.10), 2);
  net_amount := p.amount - commission;
  new_balance := COALESCE(w.available_balance, 0) + net_amount;

  UPDATE public.salon_wallets
     SET available_balance = new_balance,
         total_earnings = COALESCE(total_earnings, 0) + net_amount,
         updated_at = now()
   WHERE id = w.id;

  INSERT INTO public.wallet_transactions (user_id, salon_id, wallet_id, amount, type, reason, reference_id, balance_after)
  VALUES (NULL, p.salon_id, w.id, net_amount, 'credit',
          'Booking payment (net of ' || (COALESCE(w.commission_rate,0.10)*100)::int || '% commission)',
          p.transaction_id, new_balance);

  UPDATE public.payments
     SET released_to_wallet = true
   WHERE id = p.id;

  RETURN jsonb_build_object('released', true, 'net_amount', net_amount, 'commission', commission, 'balance', new_balance);
END $$;

REVOKE EXECUTE ON FUNCTION public.release_payment_to_wallet(UUID) FROM PUBLIC, anon, authenticated;

-- Auto-release escrow for completed bookings past 48h
CREATE OR REPLACE FUNCTION public.auto_release_escrow()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec RECORD;
  released INT := 0;
BEGIN
  FOR rec IN
    SELECT p.id FROM public.payments p
    LEFT JOIN public.bookings b ON b.id = p.booking_id
    WHERE p.status = 'SUCCESS'
      AND p.released_to_wallet = false
      AND p.salon_id IS NOT NULL
      AND (
        (p.escrow_release_at IS NOT NULL AND p.escrow_release_at < now())
        OR (b.status = 'completed')
      )
    LIMIT 500
  LOOP
    BEGIN
      PERFORM public.release_payment_to_wallet(rec.id);
      released := released + 1;
    EXCEPTION WHEN OTHERS THEN
      CONTINUE;
    END;
  END LOOP;
  RETURN released;
END $$;

REVOKE EXECUTE ON FUNCTION public.auto_release_escrow() FROM PUBLIC, anon, authenticated;

-- Process pending settlements (mark last_settlement_at)
CREATE OR REPLACE FUNCTION public.process_pending_settlements()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE updated INT;
BEGIN
  UPDATE public.salon_wallets
     SET last_settlement_at = now(),
         updated_at = now()
   WHERE available_balance >= 500
   RETURNING 1 INTO updated;
  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated;
END $$;

REVOKE EXECUTE ON FUNCTION public.process_pending_settlements() FROM PUBLIC, anon, authenticated;

-- Request withdrawal (debits wallet immediately, creates pending withdrawal)
CREATE OR REPLACE FUNCTION public.request_withdrawal(_salon_id UUID, _amount NUMERIC, _bank JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  w RECORD;
  wid UUID;
  new_balance NUMERIC(10,2);
BEGIN
  IF NOT public.is_salon_owner(auth.uid(), _salon_id) THEN
    RAISE EXCEPTION 'Not authorized for this salon';
  END IF;
  IF _amount <= 0 THEN RAISE EXCEPTION 'Invalid amount'; END IF;

  SELECT * INTO w FROM public.salon_wallets WHERE salon_id = _salon_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'No wallet'; END IF;
  IF w.available_balance < _amount THEN RAISE EXCEPTION 'Insufficient balance'; END IF;

  new_balance := w.available_balance - _amount;
  UPDATE public.salon_wallets
     SET available_balance = new_balance,
         total_withdrawals = COALESCE(total_withdrawals,0) + _amount,
         updated_at = now()
   WHERE id = w.id;

  INSERT INTO public.withdrawals (salon_id, amount, status, bank_account_details)
  VALUES (_salon_id, _amount, 'pending', _bank)
  RETURNING id INTO wid;

  INSERT INTO public.wallet_transactions (user_id, salon_id, wallet_id, amount, type, reason, reference_id, balance_after)
  VALUES (auth.uid(), _salon_id, w.id, _amount, 'debit', 'Withdrawal request', wid::text, new_balance);

  RETURN wid;
END $$;

GRANT EXECUTE ON FUNCTION public.request_withdrawal(UUID, NUMERIC, JSONB) TO authenticated;
