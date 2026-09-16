import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { isIndexPath, matchPathParams } from "./router-match.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const tree = readFileSync(join(root, "src/routeTree.gen.ts"), "utf8");

describe("detail route matching", () => {
  it("file convention: layout is route.tsx, detail is $id.tsx, no sibling layout", () => {
    assert.equal(existsSync(join(root, "src/routes/fontes.tsx")), false);
    assert.equal(existsSync(join(root, "src/routes/oportunidades.tsx")), false);
    assert.equal(existsSync(join(root, "src/routes/fontes/route.tsx")), true);
    assert.equal(existsSync(join(root, "src/routes/oportunidades/route.tsx")), true);
    assert.equal(existsSync(join(root, "src/routes/fontes/$id.tsx")), true);
    assert.equal(existsSync(join(root, "src/routes/oportunidades/$id.tsx")), true);
    assert.equal(existsSync(join(root, "src/routes/fontes/index.tsx")), true);
    assert.equal(existsSync(join(root, "src/routes/oportunidades/index.tsx")), true);
  });

  it("generated tree parents /fontes/$id and /oportunidades/$id", () => {
    assert.match(tree, /from '\.\/routes\/fontes\/route'/);
    assert.match(tree, /from '\.\/routes\/fontes\/\$id'/);
    assert.match(tree, /from '\.\/routes\/oportunidades\/route'/);
    assert.match(tree, /from '\.\/routes\/oportunidades\/\$id'/);
    assert.match(tree, /id: '\/fontes\/\$id'/);
    assert.match(tree, /fullPath: '\/fontes\/\$id'/);
    assert.match(tree, /id: '\/oportunidades\/\$id'/);
    assert.match(tree, /fullPath: '\/oportunidades\/\$id'/);
    assert.match(
      tree,
      /const FontesIdRoute = FontesIdRouteImport\.update\(\{\s*id: '\/\$id',\s*path: '\/\$id',\s*getParentRoute: \(\) => FontesRouteRoute,/s,
    );
    assert.match(
      tree,
      /const OportunidadesIdRoute = OportunidadesIdRouteImport\.update\(\{\s*id: '\/\$id',\s*path: '\/\$id',\s*getParentRoute: \(\) => OportunidadesRouteRoute,/s,
    );
  });

  it("/fontes/src_pcp_porto_belo_sc → route /fontes/$id → id intact", () => {
    const params = matchPathParams("/fontes/src_pcp_porto_belo_sc", "/fontes/$id");
    assert.deepEqual(params, { id: "src_pcp_porto_belo_sc" });
  });

  it("/fontes/src_br_pncp → route /fontes/$id → id intact", () => {
    const params = matchPathParams("/fontes/src_br_pncp", "/fontes/$id");
    assert.deepEqual(params, { id: "src_br_pncp" });
  });

  it("/oportunidades/opp_can_m7_sport_5 → route /oportunidades/$id → id intact", () => {
    const params = matchPathParams(
      "/oportunidades/opp_can_m7_sport_5",
      "/oportunidades/$id",
    );
    assert.deepEqual(params, { id: "opp_can_m7_sport_5" });
  });

  it("/fontes stays index, not detail", () => {
    assert.equal(isIndexPath("/fontes", "/fontes"), true);
    assert.equal(matchPathParams("/fontes", "/fontes/$id"), null);
  });

  it("/oportunidades stays index, not detail", () => {
    assert.equal(isIndexPath("/oportunidades", "/oportunidades"), true);
    assert.equal(matchPathParams("/oportunidades", "/oportunidades/$id"), null);
  });
});
