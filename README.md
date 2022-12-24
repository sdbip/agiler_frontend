# NodeJS Template

Support for...

- ES Modules
- TypeScript
- Mocha/Chai

## Scripts

Start web application

```shell
yarn build && yarn start
```

## Deployment

Create a new app on Cyclic.sh linking to this repo.

1. Switch to the `cyclic` branch
2. Merge the `development` branch into cyclic.
3. Run `yarn deploy` and check in any changes in the dist/ directory.
  1. Use `git commit --amend` to integrate the generated files with the merge commit.
  2. Take the opportunity to rename the commit to identify the deployed changes.
4. Push the cyclic branch to the repo.

Cyclic.sh will use the file in the dist/ diretory to run the application. Push to GitHub to trigger Cyclic.sh to redeploy.
