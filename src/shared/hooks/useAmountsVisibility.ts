import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const HIDDEN_AMOUNT = '******';

const showBalanceAtom = atomWithStorage('showBalance', true);
const showCapitalAtom = atomWithStorage('showCapital', true);

export const useAmountsVisibility = () => {
  const [showBalance, setShowBalance] = useAtom(showBalanceAtom);
  const [showCapital, setShowCapital] = useAtom(showCapitalAtom);

  return { showBalance, showCapital, setShowBalance, setShowCapital };
};