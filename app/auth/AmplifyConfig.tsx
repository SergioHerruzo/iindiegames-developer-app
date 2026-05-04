import { Amplify } from "aws-amplify";

function requireEnvironmentVariable(name: string): string {
    const value = import.meta.env[name];
    if (!value)
        throw new Error(`Environment variable ${name} is required but not set.`);
    return value;
}

export function configureAmplify() {
    Amplify.configure({
        Auth: {
            Cognito: {
                userPoolId: requireEnvironmentVariable("VITE_AWS_USER_POOL_ID"),
                userPoolClientId: requireEnvironmentVariable("VITE_AWS_USER_POOL_CLIENT_ID"),
                loginWith: {
                    username: true,
                }
            }
        }
    })
}