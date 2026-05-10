export type DeveloperGameBuildDetail = {
    buildId: string;
    versionName: string;
    status: string;
    isReleaseBuild: boolean;
    manifestUrl: string | null;
    executableFilePath: string | null;
}