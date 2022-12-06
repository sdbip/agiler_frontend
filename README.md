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

Run `yarn.build` and check in any changes in the dist/ directory.
Cyclic.sh will use said files to run the application.
Push to GitHub to trigger Cyclic.sh to redeploy.
