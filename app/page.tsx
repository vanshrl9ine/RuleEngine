'use client';
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Adjust the import based on your actual path
import AddRuleForm from "@/components/addrule/addrule";
import CombineRuleForm from "@/components/combinerule/combinerules";

export default function Home() {
  const [selectedForm, setSelectedForm] = useState("");

  return (
    <div>
      <Select onValueChange={setSelectedForm}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a form" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="add">Add Rule Form</SelectItem>
          <SelectItem value="combine">Combine Rule Form</SelectItem>
        </SelectContent>
      </Select>

      {selectedForm === "add" && <AddRuleForm />}
      {selectedForm === "combine" && <CombineRuleForm />}
    </div>
  );
}
