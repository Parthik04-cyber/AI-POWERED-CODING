"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionAccessMiddleware = void 0;
const persistence_1 = require("../utils/persistence");
const accessService_1 = require("../services/accessService");
const subscriptionAccessMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Please log in to continue.' });
            return;
        }
        const user = await (0, persistence_1.getUserById)(req.user.userId);
        if (!user) {
            res.status(401).json({ error: 'User not found.' });
            return;
        }
        const accessState = (0, accessService_1.getUserAccessState)(user);
        if (!accessState.hasAccess) {
            res.status(403).json({
                error: accessService_1.TRIAL_EXPIRED_MESSAGE,
                accessStatus: accessState.status,
                trialEndsAt: accessState.trialEndsAt,
            });
            return;
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.subscriptionAccessMiddleware = subscriptionAccessMiddleware;
//# sourceMappingURL=subscription.js.map