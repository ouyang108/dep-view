export type DependencyVersion = {
   currentVersion: string, latestVersion: string, githubUrl: string, name: string, dependencies?: { [key: string]: string }, devDependencies?: { [key: string]: string },
   isLatest?: boolean,
}