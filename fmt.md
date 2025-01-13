# TypeScript Formatting Guidelines

1. **Prefer simplicity**  
   - Write code as simply and clearly as possible.  
   - Reduce complexity where you can.

2. **Use professional comments**  
   - When code is long or ambiguous, provide clear, concise, and helpful comments.  
   - Avoid over-commenting trivial lines.

3. **Naming conventions**  
   - **Types**: Use `PascalCase` (e.g., `UserProfile` or `OrderItem`).  
   - **Functions and methods**: Use `camelCase` (e.g., `getUserData` or `processPayment`).  
   - **Top-level constants and variables**: Use `SCREAMING_CAMEL_CASE` (e.g., `MAX_CONNECTIONS`).  
   - **Scoped constants and variables**: Use `camel_case` (e.g., `max_connections`).  
   - **Database-related naming**: When possible, variable names should match the corresponding table and field names in your database.