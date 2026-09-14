import type { Operation } from '@/shared/api/types/domain';
import { useAuth } from '@/shared/api/authProvider';
import { useAccounts } from '@/shared/api/hooks/useAccounts';
import { VBadge } from '@/shared/ui/VBadge';
import { useSetAtom } from 'jotai';
import { operationModalAtom } from '../../atoms/report';
import { OperationCardBase } from './OperationCardBase';
import styles from './operationCard.module.css';

interface TransferOperationCardProps {
  operation: Operation;
  pending?: boolean;
}

export const TransferOperationCard = ({
  operation,
  pending = false,
}: TransferOperationCardProps) => {
  const { user } = useAuth();
  const accountsQuery = useAccounts(user?.id ?? '');
  const setModal = useSetAtom(operationModalAtom);

  const accounts = accountsQuery.data ?? [];
  const fromName = accounts.find((account) => account.id === operation.from_account_id)?.name;
  const toName = accounts.find((account) => account.id === operation.to_account_id)?.name;
  const amount = Number(operation.amount) || 0;

  return (
    <OperationCardBase
      amount={amount}
      amountColor="var(--color-text-primary)"
      description={operation.description}
      badge={
        fromName && toName ? (
          <VBadge className={styles.transferBadge}>
            {fromName}&nbsp;&rarr;&nbsp;{toName}
          </VBadge>
        ) : null
      }
      date={operation.date}
      pending={pending}
      onOpen={() => setModal({ type: 'transfer', operation })}
    />
  );
};
