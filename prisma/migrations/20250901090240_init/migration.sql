-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "definition" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "workflows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "credentials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "executions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" DATETIME,
    "input_data" JSONB,
    "output_data" JSONB,
    "logs" JSONB NOT NULL DEFAULT [],
    "workflow_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "executions_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "executions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at" DESC);

-- CreateIndex
CREATE INDEX "workflows_user_id_idx" ON "workflows"("user_id");

-- CreateIndex
CREATE INDEX "workflows_is_active_idx" ON "workflows"("is_active");

-- CreateIndex
CREATE INDEX "workflows_created_at_idx" ON "workflows"("created_at" DESC);

-- CreateIndex
CREATE INDEX "credentials_user_id_idx" ON "credentials"("user_id");

-- CreateIndex
CREATE INDEX "credentials_type_idx" ON "credentials"("type");

-- CreateIndex
CREATE INDEX "executions_workflow_id_idx" ON "executions"("workflow_id");

-- CreateIndex
CREATE INDEX "executions_user_id_idx" ON "executions"("user_id");

-- CreateIndex
CREATE INDEX "executions_status_idx" ON "executions"("status");

-- CreateIndex
CREATE INDEX "executions_started_at_idx" ON "executions"("started_at" DESC);
