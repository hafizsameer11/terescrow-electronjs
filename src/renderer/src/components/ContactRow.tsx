import React from "react";

interface RowProps {
  icon: React.ReactNode; // Icon component
  label: string; // Label text
  value: string | null; // Value text
}

const ContactRow: React.FC<RowProps> = ({ icon, label, value }) => {
  return (
    <div className="flex items-center gap-4 w-[80%]">
      {/* Circular Icon */}
      <div className="flex items-center justify-center w-12 h-12 border rounded-full text-[#8A8A8A]">
        {icon}
      </div>

      {/* Label and Value */}
      <div className="flex justify-between items-center w-full">
        <div>
          <p className="text-[#8A8A8A] text-xl m-0">{label}:</p>
        </div>
        <div className="text-right">
          <p className="text-black font-normal text-xl">{value || "None"}</p>
        </div>
      </div>
    </div>

  );
};

export default ContactRow;
