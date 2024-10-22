import { parseRule } from "./utils"; // Adjust import based on your file structure

// Named export for the POST method
interface ASTNode {
    type: string;
    field?: string;
    operator?: string;
    value?: string | number;
    left?: ASTNode;
    right?: ASTNode;
}

// Example usage in the POST function
export async function POST(req: Request) {
    try {
        const { rules, operator } = await req.json(); // Expecting 'operator' in the request body
        console.log("Received Rules:", rules); // Log incoming rules

        const combinedAST = combineRules(rules, operator || "AND"); // Use provided operator, default to "AND"

        return new Response(JSON.stringify(combinedAST), { status: 200 });
    } catch (error) {
        console.error("Error in POST:", error); // Log the error
        return new Response(JSON.stringify({ error: 'Error combining rules' }), { status: 500 });
    }
}

// Function to combine multiple rule strings into a single AST
function combineRules(rules: string[], operator: string = "AND"): ASTNode | undefined {
    if (!rules || rules.length === 0) return undefined;

    // Parse all rules into ASTs
    const asts: (ASTNode | undefined)[] = rules.map(rule => parseRule(rule));
    const validAsts: ASTNode[] = asts.filter((ast): ast is ASTNode => ast !== undefined);

    if (validAsts.length === 0) {
        return undefined; // No valid ASTs to combine
    }

    // Deduplicate conditions from valid ASTs
    const uniqueConditions = deduplicateConditions(validAsts);

    // If only one unique condition, return it directly
    if (uniqueConditions.length === 1) {
        return uniqueConditions[0];
    }

    // Combine unique conditions into a single AST
    return combineUniqueConditions(uniqueConditions, operator);
}

// Helper function to deduplicate conditions
function deduplicateConditions(asts: ASTNode[]): ASTNode[] {
    const seenConditions = new Set<string>();
    const uniqueConditions: ASTNode[] = [];

    asts.forEach(ast => {
        collectConditions(ast, uniqueConditions, seenConditions);
    });

    return uniqueConditions;
}

// Helper function to collect unique conditions
function collectConditions(ast: ASTNode, conditions: ASTNode[], seen: Set<string>) {
    if (ast.type === "condition") {
        const conditionKey = `${ast.field} ${ast.operator} ${ast.value}`;
        if (!seen.has(conditionKey)) {
            seen.add(conditionKey);
            conditions.push(ast);
        }
    } else if (ast.type === "operator") {
        if (ast.left) collectConditions(ast.left, conditions, seen);
        if (ast.right) collectConditions(ast.right, conditions, seen);
    }
}

// Function to combine unique conditions into an AST
function combineUniqueConditions(conditions: ASTNode[], operator: string): ASTNode {
    // Start with the first condition as the initial left node
    let combinedAST: ASTNode = {
        type: "operator",
        value: operator,
        left: conditions[0],
        right: conditions[1],
    };

    // Combine the rest of the conditions into the right side
    for (let i = 2; i < conditions.length; i++) {
        combinedAST = {
            type: "operator",
            value: operator,
            left: combinedAST,
            right: conditions[i],
        };
    }

    return combinedAST;
}
