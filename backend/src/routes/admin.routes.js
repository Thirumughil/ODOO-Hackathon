import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { validate, createStaffSchema } from '../validators/auth.validator.js';
import { createStaffInvitation } from '../services/auth.service.js';
import { successResponse } from '../utils/apiResponse.js';

const router = Router();
router.use(authenticate, authorizeRoles('ADMIN'));

router.post('/staff', validate(createStaffSchema), async (req, res, next) => {
    try {
        const user = await createStaffInvitation(req.body, req.user.id);
        successResponse(res, 201, 'Staff invitation created', { user });
    } catch (error) {
        next(error);
    }
});

export default router;
