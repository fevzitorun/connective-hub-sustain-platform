"""
Alembic environment configuration.

Reads DATABASE_URL from app.config and runs migrations.
"""
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy import create_engine

from alembic import context

# this is the Alembic Config object
config = context.config

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import all models so Base.metadata knows about them
from app.database import Base
from app.models import *  # noqa: F401,F403
from app.models import report_template  # noqa: F401
from app.models import materiality  # noqa: F401
from app.models import cbam  # noqa: F401
from app.models import supply_chain  # noqa: F401
from app.models import credit_score  # noqa: F401
from app.models import integration  # noqa: F401

target_metadata = Base.metadata

# Override sqlalchemy.url with DATABASE_URL from config
from app.config import settings

# Convert async URL to sync for Alembic
sync_url = settings.database_url.replace("+asyncpg", "+psycopg2").replace("asyncpg://", "psycopg2://")


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = sync_url
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = create_engine(sync_url, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
