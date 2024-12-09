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
      <div className="flex items-center gap-5 justify-between w-[80%] ">
        <div>
          <p className="text-[#8A8A8A] text-xl">{label}:</p>

        </div>
        <div className="text-left">
          <p className="text-black font-normal text-xl text-left">{value || "None"}</p>

        </div>
      </div>
    </div>
  );
};

export default ContactRow;
