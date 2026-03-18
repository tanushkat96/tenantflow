import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/slices/authSlice";
import userService from "../../services/api/userService";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Loader, ArrowLeft } from "lucide-react";
import HeroImage from "../../assets/Hero.svg";

function AcceptInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid invitation token");
      setLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      try {
        setLoading(true);
        const response = await userService.getInvitation(token);

        if (response.success) {
          setInvitation(response.data);
        } else {
          setError(response.message || "Invalid invitation");
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Invalid or expired invitation",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      setSubmitting(true);

      try {
        const response = await userService.acceptInvitation({
          token,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
        });

        if (response.success) {
          // Auto-login after accepting invitation
          dispatch(
            loginSuccess({
              user: response.data.user,
              token: response.data.token,
            }),
          );

          toast.success("Welcome to the team!");
          navigate("/dashboard");
        } else {
          toast.error(response.message || "Failed to accept invitation");
        }
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to accept invitation",
        );
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invalid Invitation
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-light via-gray-100 to-accent">
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary transition rounded-lg hover:bg-white/50"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back</span>
      </button>

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        < div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left - Hero Image */}
          <div className="hidden lg:block">
            <img
              src={HeroImage}
              alt="Login illustration"
              className="w-full h-auto rounded-2xl shadow-lg"
            />
          </div>
        {/* Header */}
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-100 items-center">
          <div className="items-center">
            <h1 className="text-2xl font-bold text-primary items-center">TenantFlow</h1>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2 items-center">
            Join {invitation?.tenantId?.name}
          </h1>
          <p className="text-gray-600 mb-4">
            You've been invited as{" "}
            <span className="font-semibold capitalize">{invitation?.role}</span>
          </p>
      

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-3 bg-primary text-white rounded-lg hover:bg-accent transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Creating Account..."
              : "Accept Invitation & Join Team"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary hover:text-secondary font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
    </div>
    </div>
    
  );
}

export default AcceptInvite;
