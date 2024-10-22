interface ASTNode {
    type: string;
    field?: string;
    operator?: string;
    value?: string | number;
    left?: ASTNode;
    right?: ASTNode;
}
// Function to parse the rule string into an AST
export function parseRule(ruleString: string): ASTNode | undefined {
    // Regex to match simple conditions like "age > 30" or "department = 'Sales'"
    const conditionRegex = /(\w+)\s*(>|<|=)\s*('[^']*'|\d+)/;

    // Tokenize the rule string and handle parentheses properly
    let tokens = ruleString
        .replace(/\(/g, " ( ")
        .replace(/\)/g, " ) ")
        .split(" ")
        .filter(token => token.trim().length > 0);

    // Helper function to build the AST recursively
    function buildAST(tokens: string[]): ASTNode | undefined {
        if (tokens.length === 0) return undefined;

        const token = tokens.shift();

        // Handle opening parenthesis for nested expressions
        if (token === "(") {
            const left = buildAST(tokens);
            const operator = tokens.shift(); // Get the operator (AND/OR)
            const right = buildAST(tokens);
            tokens.shift(); // Remove closing parenthesis ')'

            return {
                type: "operator",
                value: operator || '', // Provide a fallback for operator if undefined
                left,
                right,
            };
        } 
        // Handle conditions like "age > 30" or "department = 'Sales'"
        else if (conditionRegex.test(`${token} ${tokens[0]} ${tokens[1]}`)) {
            const [field, operator, value] = [token, tokens.shift(), tokens.shift()];

            return {
                type: "condition",
                field: field,
                operator: operator,
                value: value?.replace(/'/g, '') || '', // Fallback to an empty string if value is undefined
            };
        }
        // Handle logical operators "AND" and "OR"
        else if (token === "AND" || token === "OR") {
            return {
                type: "operator",
                value: token,
                left: buildAST(tokens),
                right: buildAST(tokens),
            };
        }

        return undefined;
    }

    return buildAST(tokens);
}
