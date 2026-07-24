"""taxonomy_assessments table

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-07-24 00:00:00.000000

Elle yazıldı (bkz. a1b2c3d4e5f6 — aynı gerekçe, yerel/CI'da Postgres yok).
EU Taxonomy hesaplama sonucunu (önceden sadece reports.compliance_detail
içinde geçici olarak tutuluyordu) kalıcı, sorgulanabilir hale getiriyor.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('taxonomy_assessments',
        sa.Column('id', sa.UUID(as_uuid=False), nullable=False),
        sa.Column('company_id', sa.UUID(as_uuid=False), nullable=False),
        sa.Column('assessment_year', sa.Integer(), nullable=False),
        sa.Column('nace_code', sa.String(length=20), nullable=False),
        sa.Column('eligibility_percent', sa.Float(), nullable=False),
        sa.Column('alignment_percent', sa.Float(), nullable=False),
        sa.Column('objectives', sa.JSON(), nullable=True),
        sa.Column('turnover_percent', sa.Float(), nullable=False),
        sa.Column('capex_percent', sa.Float(), nullable=False),
        sa.Column('opex_percent', sa.Float(), nullable=False),
        sa.Column('recommendations', sa.JSON(), nullable=True),
        sa.Column('status', sa.String(length=30), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('company_id', 'assessment_year'),
    )


def downgrade() -> None:
    op.drop_table('taxonomy_assessments')
