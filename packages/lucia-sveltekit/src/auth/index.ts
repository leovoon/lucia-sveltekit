import type { Handle, ServerLoad } from "@sveltejs/kit";
import type { Adapter, Env } from "../types.js";

import { generateRandomString } from "../utils/crypto.js";
import { sequence } from "@sveltejs/kit/hooks";
import { handleEndpointsFunction, handleTokensFunction } from "./hooks.js";
import {
    authenticateUserFunction,
    createUserFunction,
    deleteUserFunction,
    getUserFunction,
} from "./user/index.js";
import {
    validateRequestByCookieFunction,
    validateRequestFunction,
} from "./request.js";
import { refreshTokensFunction } from "./refresh-token/index.js";
import { invalidateRefreshTokenFunction } from "./refresh-token/invalidate.js";
import { createUserSessionFunction } from "./session.js";
import { updateUserDataFunction } from "./user/update/user-data.js";
import { updateUserIdentifierTokenFunction } from "./user/update/identifier-token.js";
import { resetUserPasswordFunction } from "./user/reset-password.js";
import { getUserByIdFunction } from "./user/get.js";
import { AccessToken } from "$lib/utils/token.js";
import { loadFunction } from "./load.js";

export const lucia = (configs: Configurations) => {
    return new Auth(configs);
};

export class Auth {
    private adapter: Adapter;
    private secret: string;
    private generateUserId: () => string;
    private context: Context;
    private env: Env;
    constructor(configs: Configurations) {
        this.adapter = configs.adapter;
        this.secret = configs.secret;
        this.generateUserId =
            configs.generateUserId || (() => generateRandomString(8));
        this.env = configs.env;
        this.context = {
            auth: this,
            adapter: this.adapter,
            secret: this.secret,
            generateUserId: this.generateUserId,
            env: this.env,
        };
        this.authenticateUser = authenticateUserFunction(this.context);
        this.createUser = createUserFunction(this.context);
        this.getUser = getUserFunction(this.context);
        this.getUserById = getUserByIdFunction(this.context);
        this.deleteUser = deleteUserFunction(this.context);
        this.validateRequest = validateRequestFunction(this.context);
        this.validateRequestByCookie = validateRequestByCookieFunction(
            this.context
        );
        this.refreshTokens = refreshTokensFunction(this.context);
        this.invalidateRefreshToken = invalidateRefreshTokenFunction(
            this.context
        );
        this.createUserSession = createUserSessionFunction(this.context);
        this.updateUserData = updateUserDataFunction(this.context);
        this.updateUserIdentifierToken = updateUserIdentifierTokenFunction(
            this.context
        );
        this.resetUserPassword = resetUserPasswordFunction(this.context);
        this.handleTokens = handleTokensFunction(this.context);
        this.handleEndpoints = handleEndpointsFunction(this.context);
        this.load = loadFunction(this.context)
        this.handleAuth = sequence(this.handleTokens, this.handleEndpoints);
    }
    private handleTokens: ReturnType<typeof handleTokensFunction>;
    private handleEndpoints: ReturnType<typeof handleEndpointsFunction>;
    public handleAuth: Handle;
    public authenticateUser: ReturnType<typeof authenticateUserFunction>;
    public createUser: ReturnType<typeof createUserFunction>;
    public getUser: ReturnType<typeof getUserFunction>;
    public getUserById: ReturnType<typeof getUserByIdFunction>;
    public deleteUser: ReturnType<typeof deleteUserFunction>;
    public validateRequest: ReturnType<typeof validateRequestFunction>;
    public validateRequestByCookie: ReturnType<
        typeof validateRequestByCookieFunction
    >;
    public refreshTokens: ReturnType<typeof refreshTokensFunction>;
    public invalidateRefreshToken: ReturnType<
        typeof invalidateRefreshTokenFunction
    >;
    public createUserSession: ReturnType<typeof createUserSessionFunction>;
    public updateUserData: ReturnType<typeof updateUserDataFunction>;
    public updateUserIdentifierToken: ReturnType<
        typeof updateUserIdentifierTokenFunction
    >;
    public resetUserPassword: ReturnType<typeof resetUserPasswordFunction>;
    public load: ReturnType<typeof loadFunction>
    public validateAccessToken = async (
        accessToken: string,
        fingerprintToken: string
    ) => {
        const accessTokenInstance = new AccessToken(accessToken, this.context);
        return await accessTokenInstance.user(fingerprintToken);
    };
    public getAuthSession: ServerLoad = async ({ locals }) => {
        return {
            lucia: locals.lucia,
        };
    };
}

interface Configurations {
    adapter: Adapter;
    secret: string;
    env: Env;
    generateUserId?: () => string;
}

export interface Context {
    auth: Auth;
    adapter: Adapter;
    secret: string;
    env: Env;
    generateUserId: () => string;
}
