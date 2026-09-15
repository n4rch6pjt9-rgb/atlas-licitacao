# Especificação de Engenharia — Portal Registry + Fingerprinting de Plataformas de Compras Públicas

**Produto:** Plataforma de Inteligência em Compras Públicas  
**Versão:** 1.0  
**Data:** 14/09/2026  
**Escopo:** Portais estaduais e municipais; classificação por família tecnológica/funcional; roteamento para adapters reutilizáveis  
**Runtime alvo:** Node.js 22 + TypeScript + PostgreSQL  
**Status:** Proposta de implementação

---

# 1. Objetivo

Criar uma camada nacional de cadastro, classificação e fingerprinting de portais de compras públicas capaz de responder:

```text
qual ente?
qual portal?
qual sistema?
qual família tecnológica?
quais capacidades públicas?
quais endpoints/documentos existem?
qual sobreposição com PNCP e Compras.gov?
qual adapter reutilizável atende esse portal?
qual o nível de confiança dessa classificação?
```

O objetivo é reduzir o problema de integração de:

```text
N portais municipais/estaduais
```

para:

```text
M famílias tecnológicas + configurações por ente
```

onde:

```text
M << N
```

---

# 2. Motivação

A expansão por ente individual não escala.

Evitar:

```text
SantaCatarinaScraper
RioDeJaneiroScraper
MunicipioXScraper
MunicipioYScraper
...
```

quando vários portais pertencem à mesma família.

Destino:

```text
ParadigmaAdapter
FiorilliAdapter
LicitarDigitalAdapter
PortalComprasPublicasAdapter
GenericJsonApiAdapter
GenericJsfAdapter
GenericAspAdapter
...
```

com configuração por `source_system`.

---

# 3. Princípio central

Separar quatro conceitos:

```text
ENTE
PORTAL
SISTEMA SUBJACENTE
FORNECEDOR/FAMÍLIA
```

Exemplo conceitual:

```text
ENTE
Estado de Santa Catarina

PORTAL
https://www.compras.sc.gov.br/

SISTEMA(S)
e-LIC / WebLIC / outros

FAMÍLIA/FORNECEDOR
Paradigma/WBC — somente quando comprovado
```

Nunca inferir fornecedor atual apenas pela história do ente.

---

# 4. Evidência e confiança

Toda classificação deve indicar:

```text
evidence_level
confidence
evidence_url
evidence_type
last_verified_at
```

Estados:

```text
VERIFIED
STRONG_INDICATION
WEAK_INDICATION
UNKNOWN
```

---

# 5. Hierarquia de evidência

## Nível A — Prova direta

Exemplos:

```text
documento oficial do ente nomeando fornecedor/produto
contrato público
edital de contratação da plataforma
manual oficial
página institucional do fornecedor citando o cliente
HTML/asset público com identificação inequívoca do produto
```

Classificação:

```text
VERIFIED
```

## Nível B — Evidência técnica forte

Exemplos:

```text
mesmos namespaces
mesmas rotas específicas
mesmos contratos JSON
mesmos nomes de actions/classes
mesmos assets assinados pelo produto
headers ou cookies específicos
```

Classificação:

```text
STRONG_INDICATION
```

## Nível C — Similaridade superficial

Exemplos:

```text
mesma aparência
mesmos nomes genéricos
mesmo framework
mesma estrutura CRUD
```

Classificação:

```text
WEAK_INDICATION
```

Framework não prova fornecedor.

---

# 6. Fontes oficiais de descoberta de famílias

Usar:

```text
Transferegov — sistemas de compras integrados
portais estaduais
portais municipais
diários oficiais
contratos de TI
documentos de implantação
sites de fornecedores
documentação técnica pública
```

O Transferegov deve ser tratado como importante registry oficial de sistemas externos integrados, mas não como inventário exaustivo de todos os portais brasileiros.

---

# 7. Modelo `jurisdiction`

```text
jurisdiction
------------------------------
id
type
ibge_code
uf
name
cnpj
parent_id
active
created_at
updated_at
```

`type`:

```text
UNION
STATE
MUNICIPALITY
DISTRICT
PUBLIC_ENTITY
CONSORTIUM
OTHER
```

---

# 8. Modelo `source_system`

```text
source_system
------------------------------
id
jurisdiction_id

name
slug
base_url

functional_family
technology_family

vendor_name
product_name

vendor_evidence_level
vendor_confidence

public_access
active

pncp_overlap
comprasgov_overlap

discovery_strategy
connector_type
connector_version

first_seen_at
last_verified_at

notes
```

---

# 9. `functional_family`

Classifica o papel funcional do portal:

```text
PROCUREMENT_TRANSACTIONAL
PROCUREMENT_DISCOVERY
PLANNING
PRICE_RESEARCH
ARP
CONTRACTS
SUPPLIERS
TRANSPARENCY_HUB
MULTI_FUNCTION
UNKNOWN
```

Um sistema pode possuir múltiplas capabilities; `functional_family` é apenas a função dominante.

---

# 10. `technology_family`

Enum inicial:

```text
PNCP
COMPRAS_GOV

PARADIGMA_WBC
SCPI_FIORILLI
LICITAR_DIGITAL
PORTAL_COMPRAS_PUBLICAS
LICITANET
BLL
BBMNET
BANCO_DO_BRASIL
BNC
SISTEMA_PROPRIO

GENERIC_JSON_API
GENERIC_REST_API
GENERIC_JSF
GENERIC_STRUTS_ACTION
GENERIC_ASP
GENERIC_SSR
GENERIC_SPA
UNKNOWN
```

Somente atribuir marca/fornecedor quando evidência for suficiente.

---

# 11. Modelo `source_evidence`

```text
source_evidence
------------------------------
id
source_system_id

evidence_type
evidence_level

title
description
url

observed_value
expected_signature

captured_at
verified_by
content_hash
raw_payload
```

Tipos:

```text
OFFICIAL_DOCUMENT
PUBLIC_CONTRACT
OFFICIAL_MANUAL
VENDOR_REFERENCE
HTML_SIGNATURE
JS_ASSET
HTTP_HEADER
COOKIE
ROUTE_SIGNATURE
JSON_SCHEMA
FORM_ACTION
ROBOTS
SITEMAP
OTHER
```

---

# 12. Modelo `source_capability`

```text
source_capability
------------------------------
id
source_system_id

capability

access_type
endpoint_or_url
method

auth_required
publicly_observed

pagination_type
documented

confidence

last_verified_at
raw_metadata
```

Capabilities:

```text
DISCOVER_PROCUREMENTS
PROCUREMENT_DETAIL
ITEMS
DOCUMENTS
RESULTS
SUPPLIERS
ARP
ARP_ITEMS
ARP_BALANCE
ARP_ADHESIONS
CONTRACTS
PLANNING
PRICE_RESEARCH
LEGISLATION
CATALOG
SEARCH
DOWNLOAD
HISTORY
```

---

# 13. Modelo `source_endpoint`

```text
source_endpoint
------------------------------
id
source_system_id

name
path
http_method

endpoint_type
public

request_schema
response_schema

pagination_type

requires_cookie
requires_csrf
requires_auth

status
last_verified_at
```

`endpoint_type`:

```text
JSON_API
REST
FORM_POST
HTML_LIST
HTML_DETAIL
FILE_DOWNLOAD
AJAX
GRAPHQL
OTHER
```

---

# 14. Modelo `fingerprint_signature`

```text
fingerprint_signature
------------------------------
id

technology_family
signature_type
key
pattern

weight
required

description
source_url
verified_at
```

---

# 15. Tipos de assinatura

```text
URL_PATH
FORM_ACTION
JSON_FIELD
JSON_SHAPE
COOKIE_NAME
HEADER
HTML_META
SCRIPT_PATH
CSS_PATH
JS_GLOBAL
SERVER_HEADER
PAGE_TEXT
FILE_NAMING
PARAMETER_NAME
PAGINATION_PATTERN
```

---

# 16. Exemplo de signature

```text
technology_family = PARADIGMA_WBC
signature_type = ROUTE_SIGNATURE
pattern = "<padrão público comprovado>"
weight = 0.9
required = false
```

Não cadastrar padrões especulativos sem exemplo comprovado.

---

# 17. Modelo `source_fingerprint_run`

```text
source_fingerprint_run
------------------------------
id
source_system_id

started_at
completed_at

status

candidate_family
score

evidence_count
strong_evidence_count

raw_result
error
```

---

# 18. Modelo `source_fingerprint_match`

```text
source_fingerprint_match
------------------------------
id
run_id
signature_id

matched
score

observed_value
evidence_id
```

---

# 19. Scoring

Exemplo:

```text
official document naming product  +100
public contract naming vendor      +100
vendor client reference             +80

specific route signature            +40
specific JSON schema                +35
specific asset namespace            +35

generic framework                   +5
same CSS style                       +1
```

Classificação:

```text
>=100  VERIFIED
70-99  STRONG_INDICATION
30-69  WEAK_INDICATION
<30    UNKNOWN
```

Os pesos devem ser calibrados empiricamente.

---

# 20. Regra de conflito

Se:

```text
documento oficial diz fornecedor A
fingerprint técnico parece família B
```

não substituir automaticamente.

Criar:

```text
SOURCE_VENDOR_CONFLICT
```

para revisão.

---

# 21. `source_observation`

Guardar fatos observáveis independentemente da classificação.

```text
source_observation
------------------------------
id
source_system_id

observation_type
key
value

observed_at
source_url
raw_payload
```

Exemplos:

```text
SERVER_HEADER = nginx
COOKIE_NAME = JSESSIONID
ROUTE = /Portal-Siga/Contrato/buscar.action
CONTENT_TYPE = application/json
PAGE_SUFFIX = .xhtml
```

---

# 22. Não confundir framework com produto

Exemplo:

```text
.xhtml
```

pode indicar JSF, mas não prova:

```text
Paradigma
Fiorilli
outro fornecedor
```

Logo:

```text
technology_family = GENERIC_JSF
```

até evidência adicional.

---

# 23. Fingerprinting passivo

Permitido:

```text
GET página pública
GET robots.txt
GET sitemap.xml
GET assets públicos
HEAD recurso público
observar headers
observar cookies
observar formulários
observar endpoints usados pelo frontend público
```

Não:

```text
bypass de autenticação
forçar endpoints privados
enumerar credenciais
explorar vulnerabilidade
acessar recursos restritos
```

---

# 24. Fingerprinting do frontend

Coletar:

```text
HTML title
meta generator
script src
stylesheet href
form action
input names
route patterns
framework markers
API base paths
```

Persistir apenas identificadores úteis.

---

# 25. Fingerprinting de JSON

Para endpoint público:

```text
GET /api/...
```

calcular:

```text
sorted field names
nested shape
pagination shape
identifier patterns
enum patterns
date formats
```

Criar:

```text
schema_fingerprint
```

---

# 26. `schema_fingerprint`

```text
schema_fingerprint
------------------------------
id
source_endpoint_id

schema_hash
field_paths
type_map

sample_count

first_seen_at
last_seen_at
```

Uso:

```text
detectar mesma família
detectar schema drift
```

---

# 27. Fingerprint de paginação

Classificar:

```text
PAGE_NUMBER
OFFSET_LIMIT
CURSOR
NEXT_LINK
DATATABLES
JSF_VIEWSTATE
SERVER_SIDE_FORM
UNKNOWN
```

---

# 28. Fingerprint de documentos

Observar:

```text
download path
document ID structure
content disposition
MIME
filename pattern
redirection
```

Não baixar em massa durante fingerprinting.

---

# 29. Portal Registry — estado inicial

Exemplos conhecidos:

```text
SC — Compras SC
RJ — SIGA
GO — SISLOG
MG — SIAD/SIRP/Portal Compras
PI — Central de Compras
PR — PCA-E/SPCA-E
PA — Compras Pará
```

Inicialmente cada um pode permanecer com:

```text
technology_family = UNKNOWN
```

até classificação robusta.

---

# 30. Santa Catarina

Fatos observados no material fornecido:

```text
GET /api/modalidades-filtro
GET /api/situacoes-filtro
GET /api/orgaos-filtro
GET /api/editais?ano=...&situacao=...
```

Retorno JSON inclui:

```text
id
processo
tipo
orgaoSigla
orgaoNome
objeto
entregaProposta
abertura
situacao
```

Classificação inicial:

```text
functional_family = PROCUREMENT_DISCOVERY
technology_family = GENERIC_JSON_API
```

Até a linhagem tecnológica atual ser comprovada.

---

# 31. Rio de Janeiro

Fatos oficiais observáveis:

```text
SIGA
fornecedores
preços
contratos
licitações/PED
atas
PCA
catálogo
```

Rotas públicas observadas:

```text
/Portal-Siga/Fornecedor/buscar.action
/Portal-Siga/AtaRegistroPreco/buscar.action
/Portal-Siga/Contrato/buscar.action
```

Classificação inicial:

```text
functional_family = MULTI_FUNCTION
technology_family = GENERIC_STRUTS_ACTION
```

Somente trocar para fornecedor específico com evidência.

---

# 32. Goiás

Registrar:

```text
functional_family = MULTI_FUNCTION
technology_family = UNKNOWN
```

Capabilities a verificar:

```text
licitações
contratação direta
SRP
PCA
contratos
fornecedores
```

---

# 33. Minas Gerais

Registrar:

```text
functional_family = MULTI_FUNCTION
technology_family = SISTEMA_PROPRIO / UNKNOWN
```

Subcomponentes:

```text
SIAD
SIRP
Portal de Compras
```

Evitar tratar o portal como sistema único.

---

# 34. Piauí

Provável:

```text
functional_family = TRANSPARENCY_HUB
```

com links para múltiplos sistemas.

O adapter deve poder retornar:

```text
external_source_links
```

---

# 35. Paraná

PCA-E/SPCA-E:

```text
functional_family = PLANNING
```

Não tratá-lo como fonte completa de licitação.

---

# 36. Pará

A presença de:

```text
.xhtml
```

é observação.

Classificação inicial:

```text
technology_family = GENERIC_JSF
```

não:

```text
PARADIGMA_WBC
```

sem evidência.

---

# 37. Interface comum de adapter

```ts
interface PublicProcurementSource {
  discover(
    params: DiscoveryParams
  ): AsyncIterable<SourceProcurement>;

  getProcurement?(
    externalId: string
  ): Promise<SourceProcurementDetail>;

  getItems?(
    externalId: string
  ): Promise<SourceItem[]>;

  getDocuments?(
    externalId: string
  ): Promise<SourceDocument[]>;

  getResults?(
    externalId: string
  ): Promise<SourceResult[]>;

  getSuppliers?(
    externalId: string
  ): Promise<SourceSupplier[]>;

  getAtas?(
    externalId: string
  ): Promise<SourceAta[]>;

  getContracts?(
    externalId: string
  ): Promise<SourceContract[]>;

  getPlanning?(
    params: PlanningParams
  ): Promise<SourcePlanningRecord[]>;
}
```

---

# 38. Adapter por família

```text
connectors/
  generic-json/
  generic-jsf/
  generic-action/
  paradigma/
  fiorilli/
  licitar-digital/
  portal-compras-publicas/
  licitanet/
```

Cada adapter implementa apenas capabilities suportadas.

---

# 39. Configuração por portal

```text
source_connector_config
------------------------------
source_system_id
connector_type

base_url

paths_json

default_params_json
headers_json

pagination_config

normalization_config
document_config

enabled
```

---

# 40. Exemplo SC

```json
{
  "connectorType": "GENERIC_JSON",
  "baseUrl": "https://www.compras.sc.gov.br",
  "paths": {
    "modalities": "/api/modalidades-filtro",
    "situations": "/api/situacoes-filtro",
    "organizations": "/api/orgaos-filtro",
    "discover": "/api/editais"
  }
}
```

Sem hard-code no adapter.

---

# 41. Exemplo portal família compartilhada

```text
ParadigmaAdapter
   │
   ├── município A config
   ├── município B config
   ├── estado X config
   └── autarquia Y config
```

---

# 42. Normalização comum

Todo adapter deve produzir:

```text
SourceProcurement
------------------------------
external_id
source_system_id

process_number
procurement_number
year

modality
status

organization_name
organization_identifier

object

proposal_deadline
opening_at

source_url

raw_payload
```

---

# 43. Source item comum

```text
SourceItem
------------------------------
external_id
procurement_external_id

item_number
description

quantity
unit

estimated_unit_price
estimated_total_price

catalog_code
catalog_type

raw_payload
```

---

# 44. Source document comum

```text
SourceDocument
------------------------------
external_id
procurement_external_id

title
document_type

url
published_at

mime_type
filename

raw_payload
```

---

# 45. Entity resolution

Após normalização:

```text
local source
   ↓
SourceProcurement
   ↓
ENTITY RESOLUTION
   ├── PNCP match
   ├── Compras.gov match
   └── standalone local
```

---

# 46. Matching com PNCP

Ordem:

```text
numeroControlePNCP
CNPJ + ano + sequencial
processo + órgão
número + modalidade + ano
objeto + datas
```

Somente identificadores fortes podem gerar match automático definitivo.

---

# 47. `source_entity_link`

```text
source_entity_link
------------------------------
id
source_system_id
source_entity_type
source_external_id

canonical_entity_type
canonical_entity_id

match_method
match_score
status

created_at
verified_at
```

---

# 48. Status de link

```text
CONFIRMED
PROBABLE
REVIEW_REQUIRED
REJECTED
```

---

# 49. Discovery strategy

Tipos:

```text
PUBLIC_JSON_API
PUBLIC_REST_API
HTML_LIST
FORM_SEARCH
JSF_POSTBACK
STRUTS_ACTION
SITEMAP
RSS
FILE_EXPORT
EXTERNAL_LINK_HUB
UNKNOWN
```

---

# 50. Capabilities matrix

Exemplo:

| Source | Discovery | Detail | Items | Docs | Results | ARP | Contracts | Planning |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| SC | yes | verify | verify | verify | verify | verify | verify | verify |
| RJ | yes | yes | yes/verify | yes/verify | verify | yes | yes | yes |
| PR PCA-E | no procurement | n/a | planning | docs/verify | n/a | no | no | yes |

Essa matriz deve ser gerada do registry, não mantida manualmente em documentação.

---

# 51. Jobs

```text
DISCOVER_SOURCE_SYSTEMS
VERIFY_SOURCE_SYSTEM

FINGERPRINT_SOURCE
DISCOVER_SOURCE_CAPABILITIES
VERIFY_SOURCE_ENDPOINTS

DISCOVER_LOCAL_PROCUREMENTS
HYDRATE_LOCAL_PROCUREMENT

MATCH_LOCAL_TO_PNCP
MATCH_LOCAL_TO_COMPRAS_GOV
```

---

# 52. Scheduler

```text
source verify          semanal
fingerprint            mensal ou após mudança
capability verify      semanal
endpoint health         15m–24h conforme criticidade
discovery               conforme fonte
```

---

# 53. Source health

```text
source_endpoint_health
------------------------------
source_endpoint_id
status
last_success_at
last_failure_at
consecutive_failures
latency_ms
http_status
schema_hash
```

Estados:

```text
HEALTHY
DEGRADED
FAILING
SCHEMA_CHANGED
DISABLED
UNKNOWN
```

---

# 54. Schema drift

Quando `schema_hash` mudar:

```text
SCHEMA_CHANGED
```

Não quebrar ingestão inteira automaticamente.

Persistir payload e alerta.

---

# 55. Portal drift

Detectar:

```text
base URL mudou
endpoint mudou
HTML mudou
form action mudou
asset namespace mudou
vendor mudou
```

Criar:

```text
PORTAL_FINGERPRINT_CHANGED
```

---

# 56. Segurança

Fingerprinting e coleta somente sobre recursos públicos.

Não:

```text
login automatizado sem autorização
bypass CAPTCHA
replay de sessão privada
enumeração de usuário
fuzzing ofensivo
exploração de endpoint
```

---

# 57. Rate control

Por fonte:

```text
source_rate_policy
------------------------------
source_system_id
max_concurrency
requests_per_second
timeout_ms
backoff_profile
```

Default conservador até telemetria.

---

# 58. Cache

Dados estáticos:

```text
modalidades
situações
órgãos
catálogos
```

podem ter refresh menos frequente.

Não repetir a cada discovery.

---

# 59. Evidence snapshot

Para evidência de fornecedor/família:

```text
content_hash
captured_at
source_url
snippet
```

Preservar para auditoria futura.

---

# 60. Portal Registry API

```http
GET /api/sources
GET /api/sources/{id}
GET /api/sources/{id}/capabilities
GET /api/sources/{id}/endpoints
GET /api/sources/{id}/evidence
GET /api/sources/{id}/fingerprints

POST /api/sources/{id}/verify
POST /api/sources/{id}/fingerprint
```

---

# 61. Consulta por família

```http
GET /api/source-families
GET /api/source-families/{family}/sources
```

Uso:

```text
quantos portais usam esta família?
quais adapters já cobrem?
qual cobertura geográfica?
```

---

# 62. Métricas estratégicas

```text
sources_total
sources_verified
sources_unknown_family

sources_by_family
sources_by_capability

jurisdictions_covered
municipalities_covered

sources_with_public_api
sources_with_documents
sources_with_results
sources_with_planning

adapter_reuse_ratio
```

---

# 63. Métrica de reutilização

```text
adapter_reuse_ratio =
sources_using_shared_adapter /
total_integrated_sources
```

Quanto maior, melhor a escalabilidade.

---

# 64. Métrica de cobertura

Separar:

```text
jurisdiction coverage
procurement coverage
document coverage
item coverage
result coverage
```

Não usar apenas “quantos municípios”.

---

# 65. Priorização de integração

Score sugerido:

```text
coverage potential
+ procurement volume
+ public API quality
+ data richness
+ adapter reuse potential
+ PNCP complementarity
- implementation cost
- source instability
```

---

# 66. `integration_priority_score`

```text
integration_priority_score
------------------------------
source_system_id

volume_score
data_richness_score
reuse_score
complementarity_score

implementation_cost_score
stability_risk_score

final_score
calculated_at
```

---

# 67. Golden portals

Usar portais de referência para contract tests:

```text
SC → JSON API
RJ → action/form multi-function
PA → JSF-like
PR → planning
```

Adicionar um golden real por família confirmada.

---

# 68. Teste de classificação

Caso:

```text
apenas .xhtml + JSESSIONID
```

Esperado:

```text
GENERIC_JSF
não PARADIGMA_WBC
```

---

# 69. Teste de prova direta

Caso:

```text
contrato público identifica WBC/Paradigma
```

Esperado:

```text
technology_family = PARADIGMA_WBC
evidence_level = VERIFIED
```

---

# 70. Teste de mudança de fornecedor

Primeira verificação:

```text
vendor = A
```

Nova evidência oficial:

```text
vendor = B
```

Esperado:

```text
preservar histórico
encerrar validade de A
criar relação B
```

---

# 71. Histórico temporal de plataforma

Criar:

```text
source_platform_history
------------------------------
id
source_system_id

technology_family
vendor_name
product_name

valid_from
valid_to

evidence_id
confidence
```

Isso é fundamental para portais migrados.

---

# 72. Não sobrescrever história

Exemplo:

```text
2015 → Paradigma/WBC
2026 → frontend/API própria
```

Isso pode ser verdade ao mesmo tempo.

Não transformar em:

```text
current_vendor = Paradigma
```

sem prova atual.

---

# 73. Topologia de portal

Um ente pode possuir vários sistemas:

```text
source_system_relationship
------------------------------
source_system_id
related_source_system_id
relation_type
```

Relações:

```text
FRONTEND_OF
LINKS_TO
MIRRORS
EXPORTS_TO
IMPORTS_FROM
REPLACED_BY
LEGACY_OF
PLANNING_FOR
EXECUTION_FOR
```

---

# 74. Exemplo de ecossistema

```text
Estado
 ├ portal público
 ├ sistema transacional
 ├ planejamento
 ├ contratos
 └ transparência
```

Não presumir 1 domínio = 1 sistema.

---

# 75. Integração com PNCP/Compras.gov

Portal Registry não substitui esses clientes.

Ele roteia:

```text
source_system
   ↓
connector
   ↓
source_record
   ↓
canonical graph
```

PNCP e Compras.gov permanecem fontes estruturais próprias.

---

# 76. Relação com `source_record`

Toda ingestão local:

```text
source = LOCAL_PORTAL
source_system_id = X
source_entity_type
source_identifier
payload_hash
raw_payload
```

---

# 77. Nomeação

Evitar tabela:

```text
municipal_scraper
```

Preferir:

```text
source_system
source_connector_config
source_endpoint
source_capability
```

porque a mesma arquitetura atende:

```text
estado
município
autarquia
consórcio
empresa pública
```

---

# 78. Fase 1 — Registry

Implementar:

```text
jurisdiction
source_system
source_capability
source_endpoint
source_evidence
```

Cadastrar:

```text
SC
RJ
GO
MG
PI
PR
PA
```

---

# 79. Fase 2 — Fingerprinting

Implementar:

```text
source_observation
fingerprint_signature
source_fingerprint_run
source_fingerprint_match
schema_fingerprint
```

---

# 80. Fase 3 — Adapters genéricos

Prioridade:

```text
GENERIC_JSON_API
GENERIC_JSF
GENERIC_STRUTS_ACTION
EXTERNAL_LINK_HUB
PLANNING_ONLY
```

---

# 81. Fase 4 — Famílias comerciais

Somente após evidência:

```text
PARADIGMA_WBC
SCPI_FIORILLI
LICITAR_DIGITAL
PORTAL_COMPRAS_PUBLICAS
LICITANET
...
```

---

# 82. Fase 5 — Censo nacional

Descobrir:

```text
portais estaduais
capitais
municípios de maior volume
sistemas integrados ao Transferegov
clientes públicos declarados por fornecedores
```

---

# 83. Estratégia municipal

Primeiro:

```text
identificar família
```

Depois:

```text
testar adapter existente
```

Só criar novo adapter quando:

```text
família não suportada
```

---

# 84. Fluxo automático

```text
novo portal
   ↓
REGISTER
   ↓
PASSIVE FINGERPRINT
   ↓
CAPABILITY DISCOVERY
   ↓
FAMILY CLASSIFICATION
   ↓
ADAPTER MATCH
   │
   ├─ existing → configure
   │
   └─ missing → engineering review
```

---

# 85. Estado de classificação

```text
DISCOVERED
OBSERVED
FINGERPRINTED
CLASSIFIED
ADAPTER_READY
INGESTING
DEGRADED
DISABLED
```

---

# 86. UI interna

Tela:

```text
Portal Registry
─────────────────────────────────
SC  Compras SC
JSON API
family: UNKNOWN/GLOBAL JSON
capabilities: discovery
adapter: generic-json
status: healthy

RJ  SIGA
action/form
capabilities: procurement/ARP/contracts/PCA
adapter: generic-action
family vendor: unverified
```

---

# 87. Painel de famílias

```text
PARADIGMA_WBC
12 fontes verificadas
7 integradas
5 pendentes

GENERIC_JSON_API
24 fontes
18 integradas
```

---

# 88. Alertas internos

```text
NEW_SOURCE_DISCOVERED
SOURCE_FAMILY_CONFIRMED
SOURCE_VENDOR_CONFLICT
SCHEMA_CHANGED
PORTAL_FINGERPRINT_CHANGED
ENDPOINT_DOWN
ADAPTER_REUSABLE
```

---

# 89. Critérios de aceitação — Registry

1. cadastrar ente e múltiplos portais;
2. separar portal de sistema e fornecedor;
3. registrar capabilities;
4. registrar endpoints;
5. registrar evidência;
6. armazenar histórico de fornecedor/plataforma;
7. permitir UNKNOWN sem forçar classificação;
8. API de consulta;
9. vínculo com connector;
10. last_verified.

---

# 90. Critérios — Fingerprinting

1. coletar somente recursos públicos;
2. observar headers/cookies/HTML/assets/rotas;
3. gerar schema hash;
4. calcular score;
5. não usar framework como prova de fornecedor;
6. persistir evidências;
7. detectar drift;
8. preservar histórico;
9. resultado reproduzível;
10. revisão humana possível.

---

# 91. Critérios — Adapter

1. um adapter atende vários `source_system`;
2. configuração externa por portal;
3. capabilities opcionais;
4. payload original preservado;
5. idempotência;
6. source health;
7. rate policy por fonte;
8. schema drift não causa perda silenciosa;
9. integração ao `source_record`;
10. entity resolution separada do adapter.

---

# 92. Primeiro milestone

Cadastrar:

```text
SC
RJ
PA
```

e provar três paradigmas:

```text
SC → JSON API
RJ → action/form
PA → JSF
```

Implementar:

```text
generic-json
generic-action
generic-jsf
```

---

# 93. Segundo milestone

Cruzamento com registros oficiais de sistemas externos e documentação de fornecedores.

Objetivo:

```text
converter UNKNOWN
→ família verificada
```

quando possível.

---

# 94. Terceiro milestone

Selecionar uma família com múltiplos municípios e provar:

```text
1 adapter
→ 5+ portais
```

Sem fork de código por município.

---

# 95. Métrica de sucesso

Meta arquitetural:

```text
>= 80% das novas fontes
integradas por adapter existente
```

após maturidade do registry.

Não é SLO oficial; é objetivo interno de engenharia.

---

# 96. Resultado estratégico

Com Registry + Fingerprinting:

```text
PNCP / Compras.gov
       +
portais estaduais
       +
portais municipais
       ↓
famílias tecnológicas
       ↓
adapters reutilizáveis
       ↓
source records
       ↓
canonical graph
```

---

# 97. Conclusão

O problema não deve ser modelado como:

```text
5.570 municípios
= 5.570 scrapers
```

e sim:

```text
5.570 entes
→ dezenas de famílias
→ poucos adapters reutilizáveis
```

O `Portal Registry` se torna o catálogo técnico nacional das fontes.

O `Fingerprinting` identifica e valida famílias sem depender de suposições.

Os adapters convertem fontes heterogêneas em um contrato comum.

A camada de `entity resolution` converge tudo para o grafo já existente:

```text
contratação
item
documento
resultado
ata
contrato
planejamento
fornecedor
```

Esse desenho permite escalar cobertura municipal sem perder proveniência, sem atribuir fornecedor sem evidência e sem criar uma coleção incontrolável de scrapers específicos.
