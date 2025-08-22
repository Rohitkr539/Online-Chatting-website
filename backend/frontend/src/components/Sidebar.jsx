import React, { useState, useEffect } from 'react'
import { BiSearchAlt2 } from "react-icons/bi";
import { IoIosArrowBack } from "react-icons/io";
import OtherUsers from './OtherUsers';
import { clearUnread } from '../redux/userSlice';
import ProfilePhotoUploader from './ProfilePhotoUploader';
import { getImageUrl } from '../utils/image';
import FriendRequests from './FriendRequests';
import axios from "axios";
import toast from "react-hot-toast";
import {useNavigate} from "react-router-dom";
import {useSelector, useDispatch} from "react-redux";
import { setAuthUser, setOtherUsers, setSelectedUser } from '../redux/userSlice';
import { setMessages } from '../redux/messageSlice';
import { BASE_URL } from '..';
import useGetFriendRequests from '../hooks/useGetFriendRequests';
 
const Sidebar = () => {
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchMode, setSearchMode] = useState(false);
    const { otherUsers, friends } = useSelector(store => store.user);
    const dispatch = useDispatch();
    const { refreshFriendData } = useGetFriendRequests();
    const navigate = useNavigate();

    // Log when friend list changes
    useEffect(() => {
        console.log("Sidebar: friends state updated, count:", friends?.length || 0);
    }, [friends]);

    // Real-time search as user types
    useEffect(() => {
        if (!searchMode || search.trim() === "") {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const filteredUsers = otherUsers?.filter(user => 
            user.username.toLowerCase().includes(search.toLowerCase()) ||
            user.fullName.toLowerCase().includes(search.toLowerCase())
        );
        
        setSearchResults(filteredUsers || []);
    }, [search, otherUsers, searchMode]);

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/v1/user/logout`);
            navigate("/login");
            toast.success(res.data.message);
            dispatch(setAuthUser(null));
            dispatch(setMessages(null));
            dispatch(setOtherUsers(null));
            dispatch(setSelectedUser(null));
        } catch (error) {
            console.log(error);
        }
    }

    const handleUserSelect = (user) => {
        dispatch(setSelectedUser(user));
        dispatch(clearUnread(String(user._id)));
        setSearch("");
        setSearchResults([]);
        setIsSearching(false);
    };

    const clearSearch = () => {
        setSearch("");
        setSearchResults([]);
        setIsSearching(false);
    };

    const toggleSearchMode = () => {
        // When toggling back to friends mode, refresh friend data
        if (searchMode) {
            refreshFriendData();
            console.log("Refreshing friend data when returning to friends list");
        }
        setSearchMode(prev => !prev);
        clearSearch();
    };
    
    return (
        <div className='bg-base-100 border-r border-base-300 p-2 sm:p-4 flex flex-col h-full'>
            <div className='relative'>
                <ProfilePhotoUploader />
                {searchMode ? (
                    <div className='flex items-center gap-1 sm:gap-2'>
                        <button
                            onClick={toggleSearchMode}
                            className='btn btn-ghost btn-circle text-base-content'
                            aria-label="Back to friends list"
                        >
                            <IoIosArrowBack className='w-5 h-5 sm:w-6 sm:h-6' />
                        </button>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className='input input-bordered w-full text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3'
                            type="text"
                            placeholder='Search by username...'
                            autoFocus
                        />
                        {search && (
                            <button
                                onClick={clearSearch}
                                className='absolute right-12 sm:right-14 top-1/2 transform -translate-y-1/2 text-base-content/60 hover:text-base-content text-xs sm:text-sm'
                            >
                                ✕
                            </button>
                        )}
                        <button className='btn btn-ghost btn-circle'>
                            <BiSearchAlt2 className='w-5 h-5 sm:w-6 sm:h-6 outline-none'/>
                        </button>
                    </div>
                ) : (
                    <div className='flex items-center justify-between mb-2'>
                        <h2 className='text-base-content font-semibold text-lg'>
                            Friends {friends?.length > 0 && <span className='badge badge-primary badge-outline ml-2 text-sm'>({friends.length})</span>}
                        </h2>
                        <div className='flex items-center gap-2'>
                            <button
                                onClick={() => navigate('/status')}
                                className='btn btn-sm btn-info text-white p-1.5 sm:p-2 min-h-0 h-auto'
                                title="Status"
                            >
                                Status
                            </button>
                            <button
                                onClick={toggleSearchMode}
                                className='btn btn-ghost btn-circle text-base-content'
                                title="Search for users"
                            >
                                <BiSearchAlt2 className='w-5 h-5 sm:w-6 sm:h-6 outline-none'/>
                            </button>
                        </div>
                    </div>
                )}

                {/* Search results dropdown */}
                {isSearching && searchResults.length > 0 && (
                    <div className='absolute z-10 mt-1 w-full bg-base-200 rounded-md shadow-lg max-h-48 sm:max-h-60 overflow-auto'>
                        {searchResults.map(user => (
                            <div
                                key={user._id}
                                className='flex items-center gap-2 p-1.5 sm:p-2 hover:bg-base-300 cursor-pointer'
                                onClick={() => handleUserSelect(user)}
                            >
                                <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden'>
                                    <img
                                        src={getImageUrl(user.profilePhoto)} 
                                        alt={user.fullName}
                                        className='w-full h-full object-cover'
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className='text-base-content font-medium text-xs sm:text-sm truncate'>{user.fullName}</p>
                                    <p className='text-base-content/80 text-[10px] sm:text-xs truncate'>@{user.username}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isSearching && search && searchResults.length === 0 && (
                    <div className='absolute z-10 mt-1 w-full bg-base-200 rounded-md shadow-lg p-2 sm:p-3'>
                        <p className='text-base-content/80 text-center text-xs sm:text-sm'>No users found</p>
                    </div>
                )}
            </div>

            {!searchMode && <div className="divider px-1 sm:px-3 my-2 sm:my-3"></div>}

            {/* Display Friend Requests */}
            {!searchMode && <FriendRequests />}

            <div className="flex-1 overflow-auto">
                {searchMode ? (
                    <div className="pt-2">
                        <h3 className="text-base-content/80 text-sm mb-2 px-2">Search Results</h3>
                        {searchResults.length > 0 ? (
                            <OtherUsers users={searchResults} />
                        ) : search ? (
                            <p className="text-base-content/80 text-center text-sm py-4">No users found</p>
                        ) : (
                            <p className="text-base-content/80 text-center text-sm py-4">Type to search for users</p>
                        )}
                    </div>
                ) : (
                    <OtherUsers showOnlyFriends={true} />
                )}
            </div>

            <div className='mt-2'>
                <button onClick={logoutHandler} className='btn btn-neutral btn-sm text-xs sm:text-sm px-2 py-1 sm:py-1.5 h-auto min-h-0'>Logout</button>
            </div>
        </div>
    )
}

export default Sidebar