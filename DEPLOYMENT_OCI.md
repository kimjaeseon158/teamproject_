# OCI Docker Compose Deployment Guide

This guide deploys the React frontend, Django backend, and PostgreSQL database on an Oracle Cloud Infrastructure Ubuntu 22.04 LTS instance.

## 1. SSH into the OCI instance

```bash
ssh -i /path/to/your-oci-key ubuntu@YOUR_PUBLIC_IP
```

## 2. Install Docker and Compose

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker ubuntu
newgrp docker
```

## 3. Open OCI and OS firewalls

In the OCI console, add ingress rules to the instance subnet security list or NSG:

- TCP 80 from `0.0.0.0/0`
- TCP 443 from `0.0.0.0/0`
- TCP 22 from your admin IP only

Then open the OS-level firewall:

```bash
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo apt-get install -y iptables-persistent
sudo netfilter-persistent save
```

If `ufw` is enabled, also run:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

## 4. Clone the repository and switch to `dev`

```bash
cd /opt
sudo git clone https://github.com/kimjaeseon158/teamproject_.git
sudo chown -R ubuntu:ubuntu teamproject_
cd teamproject_
git fetch origin
git switch dev
git pull origin dev
```

## 5. Create environment files

Create the Django environment file:

```bash
cp Back/myproject/.env.example Back/myproject/.env
nano Back/myproject/.env
```

At minimum, replace these values:

- `SECRET_KEY`
- `REFRESH_TOKEN_HASH_SECRET`
- `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `FRONTEND_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `UPSTASH_REDIS_REST_URL`

Create the Compose environment file for PostgreSQL and frontend build args:

```bash
cp .env.example .env
nano .env
```

Make sure `Back/myproject/.env` uses the same database name, user, and password, or leave `DB_HOST=db` and let `docker-compose.yml` override the DB connection values.

## 6. Build and start

```bash
docker compose up -d --build
```

The backend container automatically waits for PostgreSQL and runs:

```bash
python manage.py migrate --noinput
```

Then it starts Gunicorn.

## 7. Check the deployment

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
```

Open:

```text
http://YOUR_PUBLIC_IP
```

## 8. Common operations

Apply new code after pulling from `dev`:

```bash
git pull origin dev
docker compose up -d --build
```

Run migrations manually:

```bash
docker compose exec backend python manage.py migrate
```

Open a Django shell:

```bash
docker compose exec backend python manage.py shell
```

Backup PostgreSQL:

```bash
docker compose exec db pg_dump -U teamproject teamproject > backup.sql
```

Stop services without deleting data:

```bash
docker compose down
```

Stop services and delete the PostgreSQL volume:

```bash
docker compose down -v
```

## 9. HTTPS note

This Compose setup exposes HTTP on port 80. For production HTTPS, add a TLS terminator such as Caddy, Traefik, or Certbot-managed Nginx on the host, then update:

- `CORS_ALLOWED_ORIGINS=https://your-domain.com`
- `FRONTEND_URL=https://your-domain.com`
- `GOOGLE_REDIRECT_URI=https://your-domain.com/api/google_calendar_auth/callback/`
