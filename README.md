# AI-Form-Builder-LLM

### Port forward the Database
kubectl port-forward applications-postgresql-0 --namespace=databases 5432:5432


### Start LLM Api
cd llm-api && uvicorn app:app --port 8001 --reload


### Start Api
cd api && npm run watch:op


### Start Web
cd web && npm run start
