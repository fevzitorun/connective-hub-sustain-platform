"""municipality + DPP tables, company public profile fields

Revision ID: a1b2c3d4e5f6
Revises: 8264fa3eb267
Create Date: 2026-07-24 00:00:00.000000

Elle yazıldı — yerel/CI ortamında çalışan bir Postgres bulunmadığı için
`alembic revision --autogenerate` çalıştırılamadı. app/models/__init__.py'de
tanımlı ama önceki 8264fa3eb267 migration'ında yer almayan 8 tablo
(municipality.py, product.py, product_passport.py) + companies tablosuna
public profile alanları burada elle ekleniyor. Kolon tipleri ilgili
SQLAlchemy model dosyalarından birebir alındı.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '8264fa3eb267'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── companies: herkese açık profil alanları ──────────────────────────
    op.add_column('companies', sa.Column('slug', sa.String(length=80), nullable=True))
    op.add_column('companies', sa.Column('public_profile_enabled', sa.Boolean(), nullable=False, server_default=sa.false()))
    op.create_index(op.f('ix_companies_slug'), 'companies', ['slug'], unique=True)

    # ── municipalities ────────────────────────────────────────────────────
    op.create_table('municipalities',
        sa.Column('id', sa.UUID(as_uuid=False), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('type', sa.String(length=20), nullable=False),
        sa.Column('population', sa.Integer(), nullable=True),
        sa.Column('region', sa.String(length=100), nullable=True),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('reporting_level', sa.String(length=20), nullable=False),
        sa.Column('stationary_energy_tco2e', sa.Float(), nullable=True),
        sa.Column('transportation_tco2e', sa.Float(), nullable=True),
        sa.Column('waste_tco2e', sa.Float(), nullable=True),
        sa.Column('ippu_tco2e', sa.Float(), nullable=True),
        sa.Column('afolu_tco2e', sa.Float(), nullable=True),
        sa.Column('city_data', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )

    # ── municipality_index_scores ────────────────────────────────────────
    op.create_table('municipality_index_scores',
        sa.Column('id', sa.UUID(as_uuid=False), nullable=False),
        sa.Column('municipality_id', sa.UUID(as_uuid=False), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('economic_score', sa.Float(), nullable=True),
        sa.Column('social_score', sa.Float(), nullable=True),
        sa.Column('environmental_score', sa.Float(), nullable=True),
        sa.Column('total_score', sa.Float(), nullable=True),
        sa.Column('grade', sa.String(length=3), nullable=True),
        sa.Column('criteria_breakdown', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['municipality_id'], ['municipalities.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )

    # ── products (DPP kök varlığı) ────────────────────────────────────────
    op.create_table('products',
        sa.Column('id', sa.UUID(as_uuid=False), nullable=False),
        sa.Column('company_id', sa.UUID(as_uuid=False), nullable=False),
        sa.Column('sku', sa.String(length=100), nullable=False),
        sa.Column('gtin', sa.String(length=14), nullable=True),
        sa.Column('name_tr', sa.String(length=255), nullable=False),
        sa.Column('name_en', sa.String(length=255), nullable=True),
        sa.Column('name_de', sa.String(length=255), nullable=True),
        sa.Column('name_fr', sa.String(length=255), nullable=True),
        sa.Column('description_tr', sa.Text(), nullable=True),
        sa.Column('description_en', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=30), nullable=False),
        sa.Column('subcategory', sa.String(length=100), nullable=True),
        sa.Column('batch_number', sa.String(length=50), nullable=True),
        sa.Column('serial_number', sa.String(length=100), nullable=True),
        sa.Column('weight_kg', sa.Float(), nullable=True),
        sa.Column('dimensions', sa.JSON(), nullable=True),
        sa.Column('ce_marked', sa.Boolean(), nullable=False),
        sa.Column('energy_class', sa.String(length=1), nullable=True),
        sa.Column('warranty_months', sa.Integer(), nullable=True),
        sa.Column('manufacturing_site', sa.String(length=255), nullable=True),
        sa.Column('manufacturing_country', sa.String(length=2), nullable=True),
        sa.Column('manufactured_at', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_products_company_id'), 'products', ['company_id'], unique=False)
    op.create_index(op.f('ix_products_sku'), 'products', ['sku'], unique=False)
    op.create_index(op.f('ix_products_gtin'), 'products', ['gtin'], unique=False)
    op.create_index(op.f('ix_products_batch_number'), 'products', ['batch_number'], unique=False)

    # ── product_passports ────────────────────────────────────────────────
    op.create_table('product_passports',
        sa.Column('id', sa.UUID(as_uuid=False), nullable=False),
        sa.Column('product_id', sa.UUID(as_uuid=False), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False),
        sa.Column('public_slug', sa.String(length=64), nullable=True),
        sa.Column('gs1_digital_link', sa.String(length=500), nullable=True),
        sa.Column('carbon_footprint_kgco2e', sa.Float(), nullable=True),
        sa.Column('recycled_content_pct', sa.Float(), nullable=True),
        sa.Column('repairability_score', sa.Float(), nullable=True),
        sa.Column('green_score', sa.Float(), nullable=True),
        sa.Column('green_score_breakdown', sa.JSON(), nullable=True),
        sa.Column('recycling_instructions', sa.Text(), nullable=True),
        sa.Column('data_json', sa.JSON(), nullable=True),
        sa.Column('signature', sa.Text(), nullable=True),
        sa.Column('issued_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('revoke_reason', sa.Text(), nullable=True),
        sa.Column('scan_count', sa.Integer(), nullable=False),
        sa.Column('ai_query_count', sa.Integer(), nullable=False),
        sa.Column('return_request_count', sa.Integer(), nullable=False),
        sa.Column('completeness_pct', sa.Float(), nullable=True),
        sa.Column('created_by', sa.UUID(as_uuid=False), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('public_slug'),
    )
    op.create_index(op.f('ix_product_passports_product_id'), 'product_passports', ['product_id'], unique=False)
    op.create_index(op.f('ix_product_passports_status'), 'product_passports', ['status'], unique=False)
    op.create_index(op.f('ix_product_passports_public_slug'), 'product_passports', ['public_slug'], unique=False)

    # ── passport_suppliers ───────────────────────────────────────────────
    op.create_table('passport_suppliers',
        sa.Column('id', sa.UUID(as_uuid=False), nullable=False),
        sa.Column('passport_id', sa.UUID(as_uuid=False), nullable=False),
        sa.Column('tier', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('country', sa.String(length=2), nullable=True),
        sa.Column('role', sa.String(length=100), nullable=True),
        sa.Column('material_or_component', sa.String(length=255), nullable=True),
        sa.Column('certifications', sa.JSON(), nullable=True),
        sa.Column('contact_email', sa.String(length=255), nullable=True),
        sa.Column('verified', sa.Boolean(), nullable=False),
        sa.Column('added_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['passport_id'], ['product_passports.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_passport_suppliers_passport_id'), 'passport_suppliers', ['passport_id'], unique=False)

    # ── passport_materials ───────────────────────────────────────────────
    op.create_table('passport_materials',
        sa.Column('id', sa.UUID(as_uuid=False), nullable=False),
        sa.Column('passport_id', sa.UUID(as_uuid=False), nullable=False),
        sa.Column('material_name', sa.String(length=255), nullable=False),
        sa.Column('percentage_by_weight', sa.Float(), nullable=True),
        sa.Column('source_country', sa.String(length=2), nullable=True),
        sa.Column('recycled_content_pct', sa.Float(), nullable=True),
        sa.Column('is_hazardous', sa.Boolean(), nullable=False),
        sa.Column('hazardous_details', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['passport_id'], ['product_passports.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_passport_materials_passport_id'), 'passport_materials', ['passport_id'], unique=False)

    # ── passport_documents ───────────────────────────────────────────────
    op.create_table('passport_documents',
        sa.Column('id', sa.UUID(as_uuid=False), nullable=False),
        sa.Column('passport_id', sa.UUID(as_uuid=False), nullable=False),
        sa.Column('doc_type', sa.String(length=30), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('file_url', sa.Text(), nullable=False),
        sa.Column('issued_by', sa.String(length=255), nullable=True),
        sa.Column('issued_at', sa.Date(), nullable=True),
        sa.Column('valid_until', sa.Date(), nullable=True),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['passport_id'], ['product_passports.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_passport_documents_passport_id'), 'passport_documents', ['passport_id'], unique=False)

    # ── passport_events ──────────────────────────────────────────────────
    op.create_table('passport_events',
        sa.Column('id', sa.UUID(as_uuid=False), nullable=False),
        sa.Column('passport_id', sa.UUID(as_uuid=False), nullable=False),
        sa.Column('event_type', sa.String(length=30), nullable=False),
        sa.Column('actor', sa.String(length=255), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['passport_id'], ['product_passports.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_passport_events_passport_id'), 'passport_events', ['passport_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_passport_events_passport_id'), table_name='passport_events')
    op.drop_table('passport_events')
    op.drop_index(op.f('ix_passport_documents_passport_id'), table_name='passport_documents')
    op.drop_table('passport_documents')
    op.drop_index(op.f('ix_passport_materials_passport_id'), table_name='passport_materials')
    op.drop_table('passport_materials')
    op.drop_index(op.f('ix_passport_suppliers_passport_id'), table_name='passport_suppliers')
    op.drop_table('passport_suppliers')
    op.drop_index(op.f('ix_product_passports_public_slug'), table_name='product_passports')
    op.drop_index(op.f('ix_product_passports_status'), table_name='product_passports')
    op.drop_index(op.f('ix_product_passports_product_id'), table_name='product_passports')
    op.drop_table('product_passports')
    op.drop_index(op.f('ix_products_batch_number'), table_name='products')
    op.drop_index(op.f('ix_products_gtin'), table_name='products')
    op.drop_index(op.f('ix_products_sku'), table_name='products')
    op.drop_index(op.f('ix_products_company_id'), table_name='products')
    op.drop_table('products')
    op.drop_table('municipality_index_scores')
    op.drop_table('municipalities')
    op.drop_index(op.f('ix_companies_slug'), table_name='companies')
    op.drop_column('companies', 'public_profile_enabled')
    op.drop_column('companies', 'slug')
