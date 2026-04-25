import {
    ConfirmSignUpCommand,
    CognitoIdentityProviderClient,
    InitiateAuthCommand,
    SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import type { CurrentUser } from "@models/CurrentUser";
import { httpClient, setAuthToken, setCurrentUser } from "@services/http.client";

type RegisterInput = {
    username: string;
    email: string;
    password: string;
};

type LoginInput = {
    username: string;
    password: string;
};

type CognitoTokens = {
    idToken: string;
    accessToken: string;
    refreshToken: string;
};

type AuthSession = CognitoTokens & {
    currentUser: CurrentUser;
};

type ConfirmSignUpInput = {
    username: string;
    code: string;
};

const cognitoConfig = {
    region: import.meta.env.VITE_AWS_REGION,
    userPoolId: import.meta.env.VITE_AWS_COGNITO_USER_POOL_ID,
    clientId: import.meta.env.VITE_AWS_COGNITO_CLIENT_ID,
};

function getMissingConfig(): string[] {
    const missing: string[] = [];

    if (!cognitoConfig.region?.trim()) {
        missing.push("VITE_AWS_REGION");
    }

    if (!cognitoConfig.userPoolId?.trim()) {
        missing.push("VITE_AWS_COGNITO_USER_POOL_ID");
    }

    if (!cognitoConfig.clientId?.trim()) {
        missing.push("VITE_AWS_COGNITO_CLIENT_ID");
    }

    return missing;
}

function validateConfig(): void {
    const missingConfig = getMissingConfig();

    if (missingConfig.length > 0) {
        throw new Error(`Faltan variables de entorno de Cognito: ${missingConfig.join(", ")}`);
    }
}

const cognitoClient = new CognitoIdentityProviderClient({
    region: cognitoConfig.region,
});

export async function registerWithCognito(input: RegisterInput): Promise<{ userConfirmed: boolean }> {
    validateConfig();

    const response = await cognitoClient.send(
        new SignUpCommand({
            ClientId: cognitoConfig.clientId,
            Username: input.username,
            Password: input.password,
            UserAttributes: [
                { Name: "email", Value: input.email },
                { Name: "preferred_username", Value: input.username },
            ],
        })
    );

    return { userConfirmed: Boolean(response.UserConfirmed) };
}

export async function loginWithCognito(input: LoginInput): Promise<CognitoTokens> {
    validateConfig();

    const response = await cognitoClient.send(
        new InitiateAuthCommand({
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: cognitoConfig.clientId,
            AuthParameters: {
                USERNAME: input.username,
                PASSWORD: input.password,
            },
        })
    );

    if (response.ChallengeName === "NEW_PASSWORD_REQUIRED") {
        throw new Error("Esta cuenta requiere cambio de contraseña antes de iniciar sesión.");
    }

    if (!response.AuthenticationResult) {
        throw new Error("No se pudo completar la autenticación.");
    }

    return {
        idToken: response.AuthenticationResult.IdToken ?? "",
        accessToken: response.AuthenticationResult.AccessToken ?? "",
        refreshToken: response.AuthenticationResult.RefreshToken ?? "",
    };
}

async function loadCurrentUser(): Promise<CurrentUser> {
    const response = await httpClient.get<CurrentUser>("/users/me");
    return response.data;
}

async function hydrateAuthSession(tokens: CognitoTokens): Promise<AuthSession> {
    setAuthToken(tokens.accessToken);

    const currentUser = await loadCurrentUser();
    setCurrentUser(currentUser);

    return {
        ...tokens,
        currentUser,
    };
}

export async function loginAndLoadCurrentUser(input: LoginInput): Promise<AuthSession> {
    const tokens = await loginWithCognito(input);
    return hydrateAuthSession(tokens);
}

export async function refreshSessionWithCognito(refreshToken: string): Promise<AuthSession> {
    validateConfig();

    const response = await cognitoClient.send(
        new InitiateAuthCommand({
            AuthFlow: "REFRESH_TOKEN_AUTH",
            ClientId: cognitoConfig.clientId,
            AuthParameters: {
                REFRESH_TOKEN: refreshToken,
            },
        })
    );

    if (!response.AuthenticationResult) {
        throw new Error("No se pudo renovar la sesión.");
    }

    const tokens: CognitoTokens = {
        idToken: response.AuthenticationResult.IdToken ?? "",
        accessToken: response.AuthenticationResult.AccessToken ?? "",
        refreshToken,
    };

    return hydrateAuthSession(tokens);
}

export async function confirmSignUpWithCognito(input: ConfirmSignUpInput): Promise<void> {
    validateConfig();

    await cognitoClient.send(
        new ConfirmSignUpCommand({
            ClientId: cognitoConfig.clientId,
            Username: input.username,
            ConfirmationCode: input.code,
        })
    );
}
