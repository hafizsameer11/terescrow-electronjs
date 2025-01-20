import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createSMTP, getSMTP, GetSMTPResponse, SMTPRequestData } from '@renderer/api/queries/adminqueries';
import { useAuth } from '@renderer/context/authContext';

const SmtpPage = () => {
  const [smtpDetails, setSmtpDetails] = useState<SMTPRequestData>({
    host: '',
    from: '',
    email: '',
    port: 0,
    password: '',
    encryption: '',
  });

  const { token } = useAuth();

  // Fetch SMTP details
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['smtp'],
    queryFn: () => getSMTP(token),
    enabled: !!token,
  });

  // Update SMTP details
  const { mutate: updateSmtp } = useMutation({
    mutationKey: ['smtp'],
    mutationFn: (dataa: SMTPRequestData) => createSMTP(dataa, token),
    onSuccess: () => {
      alert('SMTP Details Updated Successfully');
    },
    onError: (error) => {
      alert('Failed to update SMTP Details. Please try again.');
    },
  });

  // Populate form with fetched data
  useEffect(() => {
    if (data) {
      setSmtpDetails(data?.data);
      console.log('SMTP Details:', data);
    }
  }, [data]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSmtpDetails((prevDetails) => ({ ...prevDetails, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('SMTP Details:', smtpDetails);

    // Call mutation to update SMTP details
    updateSmtp(smtpDetails);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 w-full">
      <div className="bg-white p-8 shadow-lg rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">SMTP Configuration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="host" className="block text-sm font-medium text-gray-700">
              Host
            </label>
            <input
              type="text"
              id="host"
              name="host"
              value={smtpDetails.host}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="SMTP Host"
              required
            />
          </div>
          <div>
            <label htmlFor="from" className="block text-sm font-medium text-gray-700">
              From
            </label>
            <input
              type="text"
              id="from"
              name="from"
              value={smtpDetails.from}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="From Address"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={smtpDetails.email}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Email Address"
              required
            />
          </div>
          <div>
            <label htmlFor="port" className="block text-sm font-medium text-gray-700">
              Port
            </label>
            <input
              type="number"
              id="port"
              name="port"
              value={smtpDetails.port}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="SMTP Port"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={smtpDetails.password}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="SMTP Password"
              required
            />
          </div>
          <div>
            <label htmlFor="encryption" className="block text-sm font-medium text-gray-700">
              Encryption
            </label>
            <select
              id="encryption"
              name="encryption"
              value={smtpDetails.encryption}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="">Select Encryption</option>
              <option value="TLS">TLS</option>
              <option value="SSL">SSL</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-[#147341] text-white py-2 px-4 rounded-md hover:bg-[#0e5f2f] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default SmtpPage;
