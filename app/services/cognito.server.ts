import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";

type LoginInput = {
    username: string;
    password: string;
};

type CognitoTokens = {
    idToken: string;
    accessToken: string;
    refreshToken: string;
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

export async function refreshSessionWithCognito(refreshToken: string): Promise<Omit<CognitoTokens, "refreshToken">> {
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

    return {
        idToken: response.AuthenticationResult.IdToken ?? "",
        accessToken: response.AuthenticationResult.AccessToken ?? "",
    };
}
