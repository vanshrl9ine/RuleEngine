
// Named export for the POST method
interface ASTNode {
    type: string;
    field?: string;
    operator?: string;
    value?: string | number;
    left?: ASTNode;
    right?: ASTNode;
}
// Function to parse the rule string into an AST
// Function to parse the rule string into an AST
// Function to parse the rule string into an AST
// Function to parse the rule string into an AST
function parseRule(ruleString: string): ASTNode | undefined {
    const conditionRegex = /(\w+)\s*(>|<|=)\s*('[^']*'|\d+)/;

    // Tokenize the rule string and handle parentheses properly
    let tokens = ruleString
        .replace(/\(/g, " ( ")
        .replace(/\)/g, " ) ")
        .split(" ")
        .filter(token => token.trim().length > 0);

    // Helper function to build the AST recursively
    function buildAST(tokens: string[]): ASTNode | undefined {
        let node: ASTNode | undefined = undefined;

        while (tokens.length > 0) {
            const token = tokens.shift();

            if (token === "(") {
                // Recursively build for nested parentheses
                const nestedNode = buildAST(tokens);
                if (!node) {
                    node = nestedNode;
                } else {
                    node = {
                        type: "operator",
                        value: node.value, // Current operator
                        left: node,
                        right: nestedNode,
                    };
                }
            } 
            else if (token === ")") {
                return node;
            } 
            else if (conditionRegex.test(`${token} ${tokens[0]} ${tokens[1]}`)) {
                const [field, operator, value] = [token, tokens.shift(), tokens.shift()];
                const conditionNode: ASTNode = {
                    type: "condition",
                    field: field,
                    operator: operator,
                    value: value?.replace(/'/g, '') || '',
                };

                if (!node) {
                    node = conditionNode;
                } else {
                    node = {
                        type: "operator",
                        value: node.value, // Current operator
                        left: node,
                        right: conditionNode,
                    };
                }
            } 
            else if (token === "AND" || token === "OR") {
                const operatorNode: ASTNode = {
                    type: "operator",
                    value: token,
                };

                if (!node) {
                    node = operatorNode;
                } else {
                    node = {
                        type: "operator",
                        value: token,
                        left: node,
                        right: buildAST(tokens), // Build right-hand side after operator
                    };
                }
            }
        }

        return node;
    }

    return buildAST(tokens);
}




export async function POST(req: Request) {
    try {
        const { rules } = await req.json(); // Expecting an array of rule strings

        if (!rules || !Array.isArray(rules) || rules.length === 0) {
            return new Response(JSON.stringify({ error: 'At least one rule is required' }), { status: 400 });
        }

        // Combine rules by appending them with AND and wrapping them in parentheses
        const combinedRuleString = rules.map(rule => `(${rule})`).join(" AND ");

        console.log("Combined Rule String:", combinedRuleString); // Debugging purposes

        // Parse the combined rule string
        const ast = parseRule(combinedRuleString);

        if (!ast) {
            return new Response(JSON.stringify({ error: 'Invalid rule format' }), { status: 400 });
        }

        return new Response(JSON.stringify(ast), { status: 200 });
    } catch (error) {
        console.error("Error generating AST:", error);
        return new Response(JSON.stringify({ error: 'Error generating AST' }), { status: 500 });
    }
}
