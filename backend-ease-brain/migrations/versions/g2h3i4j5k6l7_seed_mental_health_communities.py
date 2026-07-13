"""Seed initial mental health communities with subject areas.

Revision ID: g2h3i4j5k6l7
Revises: f1g2h3i4j5k6
Create Date: 2026-01-06 15:00:00.000000

"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime


def community_exists(name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if not inspector.has_table("communities"):
        return False
    result = bind.execute(
        sa.text("SELECT 1 FROM communities WHERE name = :name LIMIT 1"),
        {"name": name},
    )
    return result.scalar() is not None


# revision identifiers, used by Alembic.
revision = "g2h3i4j5k6l7"
down_revision = "h3i4j5k6l7m8"
branch_labels = None
depends_on = None


# Mental health communities to create
MENTAL_HEALTH_COMMUNITIES = [
    {
        "name": "Anxiety & Panic Disorders",
        "subject_area": "anxiety",
        "description": "Peer support for anxiety, panic attacks, GAD, and phobias",
        "icon": "😰",
        "color": "blue",
        "crisis_hotline_phone": "988",
        "crisis_hotline_url": "https://988lifeline.org",
        "community_guidelines": "Be supportive and non-judgmental. Share coping strategies that work for you. If you're in crisis, call 988.",
    },
    {
        "name": "Depression & Mood Disorders",
        "subject_area": "depression",
        "description": "Support group for depression, bipolar disorder, and mood-related challenges",
        "icon": "🌧️",
        "color": "gray",
        "crisis_hotline_phone": "988",
        "crisis_hotline_url": "https://988lifeline.org",
        "community_guidelines": "Your feelings are valid. Share your journey without judgment. Crisis resources available.",
    },
    {
        "name": "OCD & Intrusive Thoughts",
        "subject_area": "ocd",
        "description": "Safe space for OCD sufferers to share strategies and support",
        "icon": "🔄",
        "color": "purple",
        "crisis_hotline_phone": "988",
        "crisis_hotline_url": "https://988lifeline.org",
        "community_guidelines": "OCD is treatable. Share ERP strategies and professional resources. Avoid reassurance loops.",
    },
    {
        "name": "PTSD & Trauma Recovery",
        "subject_area": "ptsd",
        "description": "Healing space for trauma survivors and those with PTSD",
        "icon": "💪",
        "color": "green",
        "crisis_hotline_phone": "988",
        "crisis_hotline_url": "https://988lifeline.org",
        "community_guidelines": "Your trauma is real. Professional help is vital. Share resources, not trauma details.",
    },
    {
        "name": "Sleep Disorders & Insomnia",
        "subject_area": "sleep",
        "description": "Tips, strategies, and support for sleep issues",
        "icon": "😴",
        "color": "indigo",
        "crisis_hotline_phone": "988",
        "crisis_hotline_url": "https://988lifeline.org",
        "community_guidelines": "Share sleep hygiene tips and what works for you. Consult a sleep specialist for diagnosis.",
    },
    {
        "name": "Eating Disorders",
        "subject_area": "eating_disorder",
        "description": "Supportive community for eating disorder recovery",
        "icon": "🍎",
        "color": "pink",
        "crisis_hotline_phone": "988",
        "crisis_hotline_url": "https://988lifeline.org",
        "community_guidelines": "Recovery is possible. Professional treatment is essential. Content warnings for detailed food/weight talk.",
    },
    {
        "name": "Bipolar Disorder Community",
        "subject_area": "bipolar",
        "description": "Peer support for bipolar I, bipolar II, and cyclothymia",
        "icon": "⚡",
        "color": "yellow",
        "crisis_hotline_phone": "988",
        "crisis_hotline_url": "https://988lifeline.org",
        "community_guidelines": "Medication management matters. Share mood tracking tips. Emergency: call 988.",
    },
    {
        "name": "Schizophrenia & Psychosis",
        "subject_area": "schizophrenia",
        "description": "Support for schizophrenia, schizoaffective disorder, and psychotic episodes",
        "icon": "🧠",
        "color": "teal",
        "crisis_hotline_phone": "988",
        "crisis_hotline_url": "https://988lifeline.org",
        "community_guidelines": "Reality-based support. Medication is vital. Peer understanding without medical advice.",
    },
    {
        "name": "General Mental Health",
        "subject_area": "general",
        "description": "General mental health discussions and support",
        "icon": "💚",
        "color": "green",
        "crisis_hotline_phone": "988",
        "crisis_hotline_url": "https://988lifeline.org",
        "community_guidelines": "All mental health challenges welcome. Be kind and supportive.",
    },
    {
        "name": "Recovery Success Stories",
        "subject_area": "success_stories",
        "description": "Share your recovery wins and inspiring moments",
        "icon": "🌟",
        "color": "gold",
        "crisis_hotline_phone": "988",
        "crisis_hotline_url": "https://988lifeline.org",
        "community_guidelines": "Celebrate progress, no matter how small. Inspire others with your journey.",
    },
]


def upgrade():
    # Get the communities table
    communities_table = sa.table(
        "communities",
        sa.column("name", sa.String),
        sa.column("subject_area", sa.String),
        sa.column("description", sa.Text),
        sa.column("icon", sa.String),
        sa.column("color", sa.String),
        sa.column("is_peer_support", sa.Boolean),
        sa.column("requires_moderation", sa.Boolean),
        sa.column("allows_anonymous_posting", sa.Boolean),
        sa.column("community_guidelines", sa.Text),
        sa.column("crisis_hotline_phone", sa.String),
        sa.column("crisis_hotline_url", sa.String),
        sa.column("created_at", sa.DateTime),
    )

    # Insert communities
    for community in MENTAL_HEALTH_COMMUNITIES:
        if community_exists(community["name"]):
            continue
        op.execute(
            communities_table.insert().values(
                name=community["name"],
                subject_area=community["subject_area"],
                description=community["description"],
                icon=community["icon"],
                color=community["color"],
                is_peer_support=True,
                requires_moderation=True,
                allows_anonymous_posting=True,
                community_guidelines=community["community_guidelines"],
                crisis_hotline_phone=community["crisis_hotline_phone"],
                crisis_hotline_url=community["crisis_hotline_url"],
                created_at=datetime.utcnow(),
            )
        )


def downgrade():
    # Delete all seeded communities
    op.execute(
        "DELETE FROM communities WHERE subject_area IN ('anxiety', 'depression', 'ocd', 'ptsd', 'sleep', 'eating_disorder', 'bipolar', 'schizophrenia', 'general', 'success_stories')"
    )
