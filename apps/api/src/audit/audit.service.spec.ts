import { AUDIT_ACTION, AUDIT_ENTITY } from './audit.constants';
import { AuditService } from './audit.service';

describe('AuditService', () => {
  it('persists audit log entry', async () => {
    const prisma = {
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
      },
    };
    const service = new AuditService(prisma as never);

    await service.log({
      actorUserId: 'user-1',
      action: AUDIT_ACTION.CONTEXT_UPDATE,
      entityType: AUDIT_ENTITY.CONTEXT_READING,
      entityId: 'cr-1',
      before: { whyText: 'old' },
      after: { whyText: 'new' },
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        actorUserId: 'user-1',
        action: AUDIT_ACTION.CONTEXT_UPDATE,
        entityType: AUDIT_ENTITY.CONTEXT_READING,
        entityId: 'cr-1',
        before: { whyText: 'old' },
        after: { whyText: 'new' },
      },
    });
  });
});
