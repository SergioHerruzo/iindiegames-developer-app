import {
    AuthenticationDetails,
    CognitoUser,
    CognitoUserAttribute,
    CognitoUserPool,
} from "amazon-cognito-identity-js";

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

function getUserPool(): CognitoUserPool {
    const missingConfig = getMissingConfig();

    if (missingConfig.length > 0) {
        throw new Error(`Faltan variables de entorno de Cognito: ${missingConfig.join(", ")}`);
    }

    return new CognitoUserPool({
        UserPoolId: cognitoConfig.userPoolId,
        ClientId: cognitoConfig.clientId,
    });
}

export function registerWithCognito(input: RegisterInput): Promise<{ userConfirmed: boolean }> {
    const attributes = [
        new CognitoUserAttribute({ Name: "email", Value: input.email }),
        new CognitoUserAttribute({ Name: "preferred_username", Value: input.username }),
    ];

    return new Promise((resolve, reject) => {
        getUserPool().signUp(input.username, input.password, attributes, [], (error, result) => {
            if (error) {
                reject(error);
                return;
            }

            resolve({ userConfirmed: Boolean(result?.userConfirmed) });
        });
    });
}

export function loginWithCognito(input: LoginInput): Promise<CognitoTokens> {
    const userPool = getUserPool();

    const cognitoUser = new CognitoUser({
        Username: input.username,
        Pool: userPool,
    });

    const authenticationDetails = new AuthenticationDetails({
        Username: input.username,
        Password: input.password,
    });

    return new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (session) => {
                resolve({
                    idToken: session.getIdToken().getJwtToken(),
                    accessToken: session.getAccessToken().getJwtToken(),
                    refreshToken: session.getRefreshToken().getToken(),
                });
            },
            onFailure: (error) => {
                reject(error);
            },
            newPasswordRequired: () => {
                reject(new Error("Esta cuenta requiere cambio de contraseña antes de iniciar sesión."));
            },
        });
    });
}
