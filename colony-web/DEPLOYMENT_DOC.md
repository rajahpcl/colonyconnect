# Deployment Documentation: Colony Web (React + Vite)

This document provides detailed instructions on how to containerize and deploy the `colony-web` project to a Kubernetes cluster using the provided configuration templates.

## 1. Prerequisites
- Docker installed on the build machine.
- `kubectl` configured to access your Kubernetes cluster.
- Access to the container registry at `a.b.c.d:5000`.

## 2. Configuration Files

### 2.1. Nginx Configuration (`nginx.conf`)
The React application is served using Nginx. Since it must run as a non-root user (UID 1001), the configuration is customized:
- **Port:** Listens on `8080` (Standard port 80 requires root privileges).
- **Logs:** Directed to `/opt/logs/access.log` and `/opt/logs/error.log` to match the Kubernetes volume mount.
- **SPA Routing:** Includes `try_files $uri /index.html;` to support React Router.

### 2.2. Dockerfile
The Dockerfile uses a multi-stage build:
1. **Builder Stage:** Uses `node:20-alpine` to install dependencies and build the project (`npm run build`). Vite outputs static files to the `dist` directory.
2. **Runner Stage:** Uses `nginx:stable-alpine`.
    - Creates user/group `1001`.
    - Creates `/opt/logs` and sets ownership to `1001`.
    - Configures Nginx permissions for `/var/cache/nginx`, `/var/run`, and `/etc/nginx/conf.d` to allow running as non-root.
    - Copies the `dist` folder to `/usr/share/nginx/html`.
    - Sets `USER 1001`.

### 2.3. Docker Ignore (`.dockerignore`)
A `.dockerignore` file is included to prevent local files like `node_modules` and `dist` from being copied into the build context. This is critical to avoid platform mismatch errors (e.g., Windows binaries being used in a Linux container).

## 3. Build and Push Instructions

Run these commands from the project root:

```bash
# 1. Build the Docker image
# Note: The build process inside Docker handles downloading the correct 
# Linux-specific native bindings for dependencies like Vite/Rolldown.
docker build -t a.b.c.d:5000/colony-web:latest .
```
# 2. Push the image to the registry
docker push a.b.c.d:5000/colony-web:latest
```

## 4. Kubernetes Deployment (`k8s-deployment.yaml`)

The deployment file includes three main components:

### 4.1. Deployment
- **Replicas:** 1 (as requested).
- **Security Context:** 
    - `runAsUser: 1001`, `runAsGroup: 1001`, `fsGroup: 1001` ensure the container runs with the specific user ID.
    - `runAsNonRoot: true` adds an extra layer of security.
- **Volumes:**
    - `tz-config`: Mounts the host's timezone file (`Asia/Calcutta`) to the container.
    - `log-volume`: Mounts `/mnt/logs2/colony-web` from the host to `/opt/logs/` in the container.
- **Environment Variables:**
    - `POD_NAME`: Captured from metadata to use as a sub-path for logs.

### 4.2. Service
- Exposes the deployment on port `80`, targeting port `8080` of the container.

### 4.3. Ingress
- **Host:** `x.y.z.w`.
- **Path:** `/colony-web` (PathType: Prefix).
- **Annotations:** Configured for `kube-nginx` with session affinity (stickiness) using cookies and extended timeouts for stability.

## 5. Deploy to Kubernetes

Apply the configuration using `kubectl`:

```bash
kubectl apply -f k8s-deployment.yaml
```

## 6. Verification

1. **Check Pod Status:**
   ```bash
   kubectl get pods -n ingress-nginx -l name=colony-web
   ```
2. **Check Logs:**
   ```bash
   kubectl logs <pod-name> -n ingress-nginx
   ```
3. **Check Service & Ingress:**
   ```bash
   kubectl get svc,ing -n ingress-nginx
   ```

## 8. Locating and Handover of the Image

There are two primary ways to provide the image to the admin team:

### Option A: Via Registry (Recommended)
If your environment has a central Docker registry (like the one mentioned in the tags: `a.b.c.d:5000`), the image is "located" there once you push it.

1.  **Push the image:**
    ```bash
    docker push a.b.c.d:5000/colony-web:latest
    ```
2.  **Notify Admin:** Tell the admin team the image name: `a.b.c.d:5000/colony-web:latest`. They can pull it directly from the registry onto the production servers.

### Option B: Via Offline File (Tarball)
If you need to send a physical file (e.g., via email, shared drive, or USB):

1.  **Locate the image ID:**
    ```bash
    docker images | grep colony-web
    ```
2.  **Export the image to a file:**
    ```bash
    docker save -o colony-web-image.tar a.b.c.d:5000/colony-web:latest
    ```
3.  **Handover:** Give the `colony-web-image.tar` file to the admin team.
4.  **Admin Import:** The admin team will load it using:
    ```bash
    docker load -i colony-web-image.tar
    ```
