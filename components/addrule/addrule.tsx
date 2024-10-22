"use client";
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// Define the form schema with Zod for rule creation (single rule string)
const formSchema = z.object({
  rule: z.string().min(1, { message: "Rule is required" }), // Single rule string input
});

const RuleEngineForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rule: "",
    },
  });

  // State to hold generated rule and AST response
  const [rule, setRule] = useState<string | null>(null);
  const [ast, setAst] = useState<object | null>(null); // To store AST from API response

  // Handle form submission to create rule
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const ruleString = values.rule;
    setRule(ruleString);
    console.log("Generated Rule:", ruleString);

    // Call API to create AST from ruleString
    // Inside your onSubmit function in RuleEngineForm component
try {
    const response = await fetch("/api/create_rule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ruleString }),
    });
  
    if (response.ok) {
      const data = await response.json();
      setAst(data); // Assuming response is the AST
      console.log("AST Response:", data);
    } else {
      console.error("Error generating AST:", response.statusText);
    }
  } catch (error) {
    console.error("Error generating AST:", error);
  }
  
  }

  return (
    <div className="h-screen flex items-center justify-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Create Rule</Button>
        </SheetTrigger>
        <SheetContent className="overflow-y-auto max-h-[90vh]">
          <SheetHeader>
            <SheetTitle>Create Rule</SheetTitle>
          </SheetHeader>

          {/* Form for Rule Creation */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Rule String Input */}
              <FormField
                control={form.control}
                name="rule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rule String </FormLabel>
                    <FormControl >
                      <Input placeholder="Enter rule string" {...field} 
                      />
                      
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button type="submit">Create Rule</Button>
            </form>
          </Form>

          {/* Display Generated Rule */}
          {rule && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <h3 className="text-lg font-semibold">Generated Rule:</h3>
              <p>{rule}</p>
            </div>
          )}

          {/* Display AST Response */}
          {ast && (
            <div className="mt-4 p-4 bg-gray-200 rounded-md">
              <h3 className="text-lg font-semibold">Generated AST:</h3>
              <pre>{JSON.stringify(ast, null, 2)}</pre>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default RuleEngineForm;
