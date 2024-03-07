# @mdugue/gedtools

Bun CLI that transforms GEDCOM files into CSV files.

Example usage:

```shell
gedcom2csv ./ancestry.ged
```

This creates 4 csv files in the current directory:

- `individuals.csv` Listing all persons (`INDI`)
- `families.csv` Listing all families (`FAM`)
- `other.csv` listing all other items

---

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

On linking for local development see https://balamurugan16.hashnode.dev/blazingly-fast-cli-with-bun
