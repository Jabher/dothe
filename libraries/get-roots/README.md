# Get-roots

simple package for getting package roots in sync manner.
provides pre-defined queries for git root, monorepo root and package root.

### API
```typescript
module "get-roots" {
    // generic function for search of any root.
    export declare function getRootByFilename(location: string, filenames: string[]): string;
    export declare const getPackageRoot: (location: string) => string;
    export declare const getGitRoot: (location: string) => string;
    export declare const getMonorepoRoot: (location: string) => string;
}
```

### Usage
```javascript
const {getPackageRoot, getGitRoot, getMonorepoRoot} = require("get-roots");
console.log({
    packageRoot: getPackageRoot(__dirname),
    gitRoot: getGitRoot(__dirname),
    monorepoRoot: getMonorepoRoot(__dirname)
})
```
