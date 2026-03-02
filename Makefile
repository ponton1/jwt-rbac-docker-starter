up:
	docker compose up --build

down:
	docker compose down

reset:
	docker compose down -v

logs:
	docker compose logs -f --tail=200

up-prod:
	docker compose -f docker-compose.prod.yml up --build

down-prod:
	docker compose -f docker-compose.prod.yml down

ps:
	docker ps

test:
	docker compose exec api npm test
