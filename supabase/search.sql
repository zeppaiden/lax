DROP FUNCTION fn_search_messages(uuid,uuid,text,integer);

CREATE OR REPLACE FUNCTION fn_search_messages(
    p_network_id UUID,
    p_account_id UUID,
    p_query TEXT,
    p_limit INTEGER
)
RETURNS TABLE (result JSONB) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    search_query tsquery := plainto_tsquery('english', p_query);
BEGIN
    -- Security checks remain the same...

    RETURN QUERY
    SELECT 
        jsonb_build_object(
            'message', to_jsonb(m.*),
            'account', to_jsonb(a.*),
            'channel', CASE 
                WHEN c.type = 'spinoff' THEN to_jsonb(pc.*)
                ELSE to_jsonb(c.*)
            END,
            'spinoff', CASE 
                WHEN c.type = 'spinoff' THEN to_jsonb(c.*)
                ELSE NULL
            END,
            'whisper', CASE 
                WHEN c.type = 'whisper' THEN (
                    SELECT to_jsonb(a.*) 
                    FROM accounts a 
                    WHERE a.account_id = ANY(
                        SELECT account_id 
                        FROM channels_accounts ca 
                        WHERE ca.channel_id = c.channel_id 
                        AND ca.account_id != m.created_by
                    )
                    LIMIT 1
                )
                ELSE NULL 
            END,
            'highlight', jsonb_build_object(
                'text', ts_headline(
                    'english',
                    m.content,
                    search_query,
                    'StartSel=<mark>, StopSel=</mark>, MaxWords=35, MinWords=15, ShortWord=3, MaxFragments=1'
                ),
                'positions', '[]'::jsonb  -- Simplified to empty array since we're not using positions
            )
        ) as result
    FROM messages m
    JOIN channels c ON m.channel_id = c.channel_id
    JOIN channels_accounts ca ON c.channel_id = ca.channel_id
    LEFT JOIN channels pc ON c.spinoff_of = pc.channel_id
    JOIN accounts a ON m.created_by = a.account_id
    WHERE c.network_id = p_network_id
    AND ca.account_id = p_account_id
    AND m.tvector @@ search_query
    ORDER BY ts_rank(m.tvector, search_query) DESC
    LIMIT p_limit;

END;
$$;

DROP FUNCTION fn_search_messages(uuid,uuid,text,integer);

CREATE OR REPLACE FUNCTION fn_search_messages(
    p_network_id UUID,
    p_account_id UUID,
    p_query TEXT,
    p_limit INTEGER
)
RETURNS TABLE (result JSONB) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    search_query tsquery := plainto_tsquery('english', p_query);
BEGIN
    RETURN QUERY
    SELECT 
        jsonb_build_object(
            'message', to_jsonb(m.*),
            'account', to_jsonb(a.*),
            'channel', CASE 
                WHEN c.type = 'spinoff' THEN to_jsonb(pc.*)
                ELSE to_jsonb(c.*)
            END,
            'spinoff', CASE 
                WHEN c.type = 'spinoff' THEN to_jsonb(c.*)
                ELSE NULL
            END,
            'whisper', CASE 
                WHEN c.type = 'whisper' THEN (
                    SELECT to_jsonb(a.*) 
                    FROM accounts a 
                    WHERE a.account_id = ANY(
                        SELECT account_id 
                        FROM channels_accounts ca 
                        WHERE ca.channel_id = c.channel_id 
                        AND ca.account_id != m.created_by
                    )
                    LIMIT 1
                )
                ELSE NULL 
            END,
            'highlight', jsonb_build_object(
                'text', ts_headline(
                    'english',
                    m.content,
                    search_query,
                    'StartSel=<mark>, StopSel=</mark>, MaxWords=35, MinWords=15, ShortWord=3, MaxFragments=1'
                ),
                'positions', '[]'::jsonb
            )
        ) as result
    FROM messages m
    JOIN channels c ON m.channel_id = c.channel_id
    JOIN channels_accounts ca ON c.channel_id = ca.channel_id
    LEFT JOIN channels pc ON c.spinoff_of = pc.channel_id
    JOIN accounts a ON m.created_by = a.account_id
    WHERE c.network_id = p_network_id
    AND ca.account_id = p_account_id
    AND m.tvector @@ search_query
    ORDER BY ts_rank(m.tvector, search_query) DESC
    LIMIT p_limit;
END;
$$;