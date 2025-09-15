import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import ConfidenceBar from "../../components/ConfidenceBar";
import { FiDownload, FiArrowLeft, FiFileText, FiAlertCircle, FiCheckCircle, FiInfo } from "react-icons/fi";
import { Tooltip } from 'react-tooltip';

export default function ContractDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/contracts/${id}`);
        setData(response.data);
      } catch (err) {
        console.error("Error fetching contract:", err);
        setError("Failed to load contract details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium";
    switch (status?.toLowerCase()) {
      case 'completed':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            <FiCheckCircle className="mr-1" /> Completed
          </span>
        );
      case 'processing':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            <span className="animate-pulse mr-1">⏳</span> Processing
          </span>
        );
      case 'failed':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            <FiAlertCircle className="mr-1" /> Failed
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            <FiFileText className="mr-1" /> Unknown
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading contract details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <FiAlertCircle className="text-red-500 text-2xl" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Contract</h2>
          <p className="text-gray-600 mb-6">{error || 'Unable to load contract details.'}</p>
          <button
            onClick={() => router.push('/contracts')}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            Back to Contracts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-indigo-700 hover:text-indigo-900 mb-6 transition-colors group font-medium"
          >
            <FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
            <span>Back to Contracts</span>
          </button>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100 p-8 mb-8 transform transition-all hover:shadow-xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Contract Analysis
                  </h1>
                  <div className="flex items-center text-indigo-600">
                    <span className="font-mono text-sm bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                      ID: {id}
                    </span>
                    <button 
                      className="ml-2 text-indigo-400 hover:text-indigo-600 transition-colors"
                      data-tooltip-id="contract-id-tooltip"
                      data-tooltip-content="Unique identifier for this contract"
                    >
                      <FiInfo size={16} />
                    </button>
                    <Tooltip id="contract-id-tooltip" place="top" />
                  </div>
                </div>
                <div className="mt-4 sm:mt-0">
                  {getStatusBadge(data.status)}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-indigo-100">
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <h3 className="text-sm font-medium text-indigo-700 mb-1">Document</h3>
                  <p className="text-indigo-900 font-medium flex items-center">
                    <FiFileText className="mr-2 text-indigo-500" />
                    {data.filename || 'contract.pdf'}
                  </p>
                </div>
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL}/contracts/${id}/download`}
                  className="mt-4 sm:mt-0 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg hover:shadow-indigo-200 transition-all hover:-translate-y-0.5"
                  download
                >
                  <FiDownload className="mr-2" /> Download Original PDF
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100 p-8 transform transition-all hover:shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-indigo-900 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></span>
                Confidence Scores
              </h2>
              <div className="text-xs px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full font-medium">
                Higher is better
              </div>
            </div>
            <div className="space-y-6">
              <ConfidenceBar 
                label="Financial completeness" 
                score={data.scoring?.financial_completeness ?? 0} 
                description="Measures how thoroughly financial terms like payment amounts, schedules, and methods are documented in the contract."
              />
              <ConfidenceBar 
                label="Party identification" 
                score={data.scoring?.party_identification ?? 0}
                description="Evaluates how clearly all parties involved in the contract are identified, including legal names and roles."
              />
              <ConfidenceBar 
                label="Payment terms clarity" 
                score={data.scoring?.payment_terms_clarity ?? 0}
                description="Assesses the clarity and specificity of payment terms, including due dates, amounts, and conditions."
              />
              <ConfidenceBar 
                label="SLA definition" 
                score={data.scoring?.sla_definition ?? 0}
                description="Measures how well the Service Level Agreements are defined, including metrics, remedies, and reporting."
              />
              <ConfidenceBar 
                label="Contact information" 
                score={data.scoring?.contact_information ?? 0}
                description="Evaluates the completeness of contact information for all relevant parties in the contract."
              />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100 overflow-hidden transform transition-all hover:shadow-xl">
            <div className="p-6 border-b border-indigo-100 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h2 className="text-xl font-bold text-white flex items-center">
                <span className="w-2 h-8 bg-white/80 rounded-full mr-3"></span>
                Extracted Data
              </h2>
              <p className="text-indigo-100 text-sm mt-1">Key information extracted from your contract</p>
            </div>
            <div className="p-6 bg-indigo-50/50 overflow-auto max-h-[600px]">
              {data.extracted && Object.keys(data.extracted).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(data.extracted).map(([key, value], index) => (
                    <div 
                      key={key} 
                      className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm hover:shadow-md transition-shadow"
                      style={{
                        background: 'white',
                        borderLeft: '4px solid',
                        borderColor: [
                          '#6366f1', // indigo
                          '#8b5cf6', // purple
                          '#ec4899', // pink
                          '#f43f5e', // rose
                          '#f59e0b'  // amber
                        ][index % 5]
                      }}
                    >
                      <h3 className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-2">
                        {key.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-gray-800 font-medium">
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/50 rounded-xl border-2 border-dashed border-indigo-100">
                  <FiFileText className="mx-auto h-14 w-14 text-indigo-300" />
                  <h3 className="mt-4 text-lg font-medium text-indigo-900">No extracted data</h3>
                  <p className="mt-1 text-indigo-400">No structured data was extracted from this document.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {data.metadata?.created_at && (
          <div className="mt-10 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-sm text-indigo-600 border border-indigo-100">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Analysis completed on {new Date(data.metadata.created_at).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
