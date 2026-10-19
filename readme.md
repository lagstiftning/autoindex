# lagstiftning-autoindex

Generates a HTML index of a single Swedish law from structured data.

All filesystem lookups in this repo assume a runtime context matching the structure defined in the README of [svenskamodellen/workspace](https://github.com/svenskamodellen/workspace).

## Commands

- Run `LAW=arbetsmiljolagen pnpm dev` to start the dev server
- Run `LAW=arbetsmiljolagen pnpm build` to run a production build
- Run `LAW=arbetsmiljolagen pnpm deploy` to deploy the latest build to production
- Run `LAW=arbetsmiljolagen pnpm ship` to run build + deploy in sequence

## Dev server URLs

- http://localhost:3000/arbetsmiljolagen/2023:349
- http://localhost:3000/arbetstidslagen/2022:450
- http://localhost:3000/medbestammandelagen/2021:1114
- http://localhost:3000/lagen-om-anstallningsskydd/2022:836

## License

[CC-0](https://github.com/lagstiftning/autoindex/blob/main/license)
