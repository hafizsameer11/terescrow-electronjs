import DepartmentsTable from "@renderer/components/DepartmentsTable";
import React, { useState } from "react";



const Departments: React.FC = () => {


  return (
    <div className="p-6 w-full">
      <h1 className="text-[40px] font-normal text-gray-800">Departments</h1>

    <DepartmentsTable />
    </div>
  );
};

export default Departments;
