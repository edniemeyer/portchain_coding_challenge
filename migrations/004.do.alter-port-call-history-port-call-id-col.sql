
ALTER TABLE port_calls_history 
ADD port_call_id INTEGER NOT NULL REFERENCES port_calls(id) ON DELETE CASCADE;