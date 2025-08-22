import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from '..';

const Signup = () => {
  const [user, setUser] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    gender: "",
  });
  const navigate = useNavigate();
  
  const handleCheckbox = (gender) => {
    setUser({ ...user, gender });
  }
  
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/user/register`, user, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
    setUser({
      fullName: "",
      username: "",
      password: "",
      confirmPassword: "",
      gender: "",
    })
  }
  
  return (
    <div className="min-w-96 mx-auto">
      <div className='card bg-base-200 shadow-xl'>
        <div className="card-body">
          <h1 className='text-3xl font-bold text-center text-primary mb-6'>Sign Up</h1>
          <form onSubmit={onSubmitHandler}>
            <div className="form-control mb-4">
              <label className='label'>
                <span className="label-text">Full Name</span>
              </label>
              <input
                value={user.fullName}
                onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                className='input input-bordered w-full'
                type="text"
                placeholder='Enter your full name'
              />
            </div>
            <div className="form-control mb-4">
              <label className='label'>
                <span className="label-text">Username</span>
              </label>
              <input
                value={user.username}
                onChange={(e) => setUser({ ...user, username: e.target.value })}
                className='input input-bordered w-full'
                type="text"
                placeholder='Choose a username'
              />
            </div>
            <div className="form-control mb-4">
              <label className='label'>
                <span className="label-text">Password</span>
              </label>
              <input
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                className='input input-bordered w-full'
                type="password"
                placeholder='Create a password'
              />
            </div>
            <div className="form-control mb-4">
              <label className='label'>
                <span className="label-text">Confirm Password</span>
              </label>
              <input
                value={user.confirmPassword}
                onChange={(e) => setUser({ ...user, confirmPassword: e.target.value })}
                className='input input-bordered w-full'
                type="password"
                placeholder='Confirm your password'
              />
            </div>
            <div className='form-control mb-6'>
              <label className='label'>
                <span className="label-text">Gender</span>
              </label>
              <div className='flex gap-6'>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      className="radio checked:bg-primary mr-2"
                      checked={user.gender === "male"}
                      onChange={() => handleCheckbox("male")}
                    />
                    <span className="label-text">Male</span>
                  </label>
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      className="radio checked:bg-primary mr-2"
                      checked={user.gender === "female"}
                      onChange={() => handleCheckbox("female")}
                    />
                    <span className="label-text">Female</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="text-center mb-4">
              <p className='text-sm'>
                Already have an account?{' '}
                <Link to="/login" className="link link-hover text-primary font-medium">
                  Log in
                </Link>
              </p>
            </div>
            <div>
              <button
                type='submit'
                className='btn btn-primary w-full'
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signup