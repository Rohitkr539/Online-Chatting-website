import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from "react-hot-toast"
import axios from "axios";
import { useDispatch } from "react-redux";
import { setAuthUser } from '../redux/userSlice';
import { BASE_URL } from '..';

const Login = () => {
  const [user, setUser] = useState({
    username: "",
    password: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/user/login`, user, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      navigate("/");
      console.log(res);
      dispatch(setAuthUser(res.data));
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
    setUser({
      username: "",
      password: ""
    })
  }
  return (
    <div className="min-w-96 mx-auto">
      <div className='card bg-base-200 shadow-xl'>
        <div className="card-body">
          <h1 className='text-3xl font-bold text-center text-blue-400 mb-6'>Login</h1>
          <form onSubmit={onSubmitHandler}>
            <div className="form-control mb-4">
              <label className='label'>
                <span className="label-text">Username*</span>
              </label>
              <input
                value={user.username}
                onChange={(e) => setUser({ ...user, username: e.target.value })}
                className='input input-bordered w-full'
                type="text"
                placeholder='Enter your username'
              />
            </div>
            <div className="form-control mb-6">
              <label className='label'>
                <span className="label-text">Password*</span>
              </label>
              <input
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                className='input input-bordered w-full'
                type="password"
                placeholder='Enter your password'
              />
            </div>
            <div className="text-center mb-4">
              <p className='text-sm'>
                Don't have an account?{' '}
                <Link to="/signup" className="link link-hover text-blue-400 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
            <div>
              <button
                type="submit"
                className='btn w-full bg-blue-600 hover:bg-blue-500 text-white border-0'
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login