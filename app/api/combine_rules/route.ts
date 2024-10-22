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

export async function POST(req: Request) {
    try {
        const { rules } = await req.json();
        console.log("Received Rules:", rules); // Log incoming rules

        if (!Array.isArray(rules) || rules.length === 0) {
            return new Response(JSON.stringify({ error: 'At least one rule is required' }), { status: 400 });
        }

        // Parse rules and filter out undefined values
        const asts: (ASTNode | undefined)[] = rules.map(rule => parseRule(rule));
        const validAsts: ASTNode[] = asts.filter((ast): ast is ASTNode => ast !== undefined);

        if (validAsts.length === 0) {
            return new Response(JSON.stringify({ error: 'No valid ASTs to combine' }), { status: 400 });
        }

        const combinedAST = combineASTs(validAsts); // Combine valid ASTs

        return new Response(JSON.stringify(combinedAST), { status: 200 });
    } catch (error) {
        console.error("Error in POST:", error); // Log the error
        return new Response(JSON.stringify({ error: 'Error combining rules' }), { status: 500 });
    }
}

// Function to combine multiple ASTs
function combineASTs(asts: ASTNode[]): ASTNode | undefined {
    if (asts.length === 0) return undefined;
    if (asts.length === 1) return asts[0]; // Return single AST directly if only one exists

    // For simplicity, combine with AND (you can change this based on your strategy)
    return {
        type: "operator",
        value: "AND",
        left: asts[0],
        right: asts[1],
    };
}
