# Paseo Foundation boundary

This folder records the downstream Foundation contract used by the local role
pack. It is not a copy of Paseo's immutable `foundation/dist` tree and does not
implement a second lifecycle engine, database, candidate ledger, or CLI.

The manifest is admission metadata: a skill must be in the current role bundle,
match its trigger, and fit the current lease/brief. Missing or invalid admission
metadata fails closed. Provider adapters transport the role policy; they do not
grant authority.
