import { useMemo } from 'react';

import SText from 'components/atoms/SText';

import { ModalEnum } from 'core/enums/modal.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { useModal } from 'core/hooks/useModal';
import { useQueryEmployees } from 'core/services/hooks/queries/useQueryEmployees';

import { ITreeMapObject } from '../../interfaces';
import {
  OrgEmployeeLeafCard,
  buildEditEmployeeModalPayload,
  buildOrgEmployeeLeavesQuery,
  toOrgEmployeeLeafCards,
} from '../../utils/get-org-employee-leaves';
import { OrgTreeNode } from '../RenderNode/styles';
import { EMPLOYEE_LEAF_WIDTH, EmployeeTreeCard } from './EmployeeTreeCard';

export function EmployeeTreeLeaves({
  node,
  horizontal,
}: {
  node: ITreeMapObject;
  horizontal?: boolean;
}) {
  const { onStackOpenModal } = useModal();
  const { companyId: routeCompanyId } = useGetCompanyId();
  const query = useMemo(
    () => buildOrgEmployeeLeavesQuery(node, { enabled: true }),
    [node],
  );

  const { data: employees, isLoading } = useQueryEmployees(1, query, 20);

  const cards = useMemo(() => toOrgEmployeeLeafCards(employees), [employees]);

  const handleOpen = (employee: OrgEmployeeLeafCard) => {
    const companyId = employee.companyId || routeCompanyId;
    if (!employee.id || !companyId) return;

    onStackOpenModal(
      ModalEnum.EMPLOYEES_ADD,
      buildEditEmployeeModalPayload({ ...employee, companyId }),
    );
  };

  if (isLoading && cards.length === 0) {
    return (
      <OrgTreeNode
        id={`node-tree-employee-loading-${node.id}`}
        horizontal={horizontal ? 1 : 0}
        className="org-tree-node is-leaf org-tree-node-employee"
      >
        <SText
          fontSize={12}
          sx={{
            width: EMPLOYEE_LEAF_WIDTH,
            px: 1,
            py: '2px',
            color: 'grey.600',
            whiteSpace: 'nowrap',
          }}
        >
          Carregando funcionários…
        </SText>
      </OrgTreeNode>
    );
  }

  return (
    <>
      {cards.map((employee) => (
        <OrgTreeNode
          key={`employee:${employee.id}`}
          id={`node-tree-employee-${employee.id}`}
          horizontal={horizontal ? 1 : 0}
          className="org-tree-node is-leaf org-tree-node-employee"
        >
          <EmployeeTreeCard employee={employee} onOpen={handleOpen} />
        </OrgTreeNode>
      ))}
    </>
  );
}
