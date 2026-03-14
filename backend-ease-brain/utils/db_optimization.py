"""
Database query optimization migration.
Adds indexes to frequently queried columns to improve performance.
"""


def add_optimization_indexes(db):
    """Add indexes to improve query performance"""

    # List of (table, column(s)) tuples to index
    indexes_to_create = [
        ("users", "email"),  # Used in login, signup verification
        ("users", "username"),  # Used in username lookups
        ("users", "is_active"),  # Used in login queries (is_active=True)
        ("users", "organization_id"),  # Used for org-based queries
        ("user_verifications", "user_id"),  # Foreign key queries
        ("user_verifications", "token"),  # Email verification lookups
        ("user_roles", "user_id"),  # Role lookups for users
        ("user_roles", "role_id"),  # Role-based filtering
        ("messages", "sender_id"),  # Message history queries
        ("messages", "receiver_id"),  # Inbox queries
        ("messages", "conversation_id"),  # Conversation threading
        ("conversations", "user1_id"),  # User conversation lookups
        ("conversations", "user2_id"),  # User conversation lookups
        ("caregiver_notes", "user_id"),  # Notes about a user
        ("caregiver_notes", "caregiver_id"),  # Notes by caregiver
        ("reminders", "user_id"),  # User reminders
        ("user_communities", "user_id"),  # Community membership
        ("user_communities", "community_id"),  # Community members
    ]

    return indexes_to_create


# Migration SQL (SQLAlchemy Alembic format)
migration_instructions = """
# In your Alembic migration file, add:

def upgrade():
    # Add indexes for performance
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_users_username', 'users', ['username'])
    op.create_index('idx_users_is_active', 'users', ['is_active'])
    op.create_index('idx_users_organization_id', 'users', ['organization_id'])

    op.create_index('idx_user_verifications_user_id', 'user_verifications', ['user_id'])
    op.create_index('idx_user_verifications_token', 'user_verifications', ['token'])

    op.create_index('idx_user_roles_user_id', 'user_roles', ['user_id'])
    op.create_index('idx_user_roles_role_id', 'user_roles', ['role_id'])

    op.create_index('idx_messages_sender_id', 'messages', ['sender_id'])
    op.create_index('idx_messages_receiver_id', 'messages', ['receiver_id'])
    op.create_index('idx_messages_conversation_id', 'messages', ['conversation_id'])

    op.create_index('idx_conversations_user1_id', 'conversations', ['user1_id'])
    op.create_index('idx_conversations_user2_id', 'conversations', ['user2_id'])

    op.create_index('idx_caregiver_notes_user_id', 'caregiver_notes', ['user_id'])
    op.create_index('idx_caregiver_notes_caregiver_id', 'caregiver_notes', ['caregiver_id'])

    op.create_index('idx_reminders_user_id', 'reminders', ['user_id'])

    op.create_index('idx_user_communities_user_id', 'user_communities', ['user_id'])
    op.create_index('idx_user_communities_community_id', 'user_communities', ['community_id'])


def downgrade():
    # Drop indexes in reverse order
    op.drop_index('idx_user_communities_community_id', 'user_communities')
    op.drop_index('idx_user_communities_user_id', 'user_communities')

    op.drop_index('idx_reminders_user_id', 'reminders')

    op.drop_index('idx_caregiver_notes_caregiver_id', 'caregiver_notes')
    op.drop_index('idx_caregiver_notes_user_id', 'caregiver_notes')

    op.drop_index('idx_conversations_user2_id', 'conversations')
    op.drop_index('idx_conversations_user1_id', 'conversations')

    op.drop_index('idx_messages_conversation_id', 'messages')
    op.drop_index('idx_messages_receiver_id', 'messages')
    op.drop_index('idx_messages_sender_id', 'messages')

    op.drop_index('idx_user_roles_role_id', 'user_roles')
    op.drop_index('idx_user_roles_user_id', 'user_roles')

    op.drop_index('idx_user_verifications_token', 'user_verifications')
    op.drop_index('idx_user_verifications_user_id', 'user_verifications')

    op.drop_index('idx_users_organization_id', 'users')
    op.drop_index('idx_users_is_active', 'users')
    op.drop_index('idx_users_username', 'users')
    op.drop_index('idx_users_email', 'users')
"""
