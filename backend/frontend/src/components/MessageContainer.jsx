import React, { useState, useEffect, useRef } from 'react'
import SendInput from './SendInput'
import Messages from './Messages';
import { useSelector, useDispatch } from "react-redux";
import { setSelectedUser, addSentFriendRequest } from '../redux/userSlice';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_URL } from '..';
import useGetFriendRequests from '../hooks/useGetFriendRequests';
import { getImageUrl } from '../utils/image';
 

const MessageContainer = () => {
    const { selectedUser, authUser, onlineUsers, sentFriendRequests, friendRequests, friends } = useSelector(store => store.user);
    const [isSending, setIsSending] = useState(false);
    const [friendshipStatus, setFriendshipStatus] = useState('none'); // 'none', 'pending_sent', 'pending_received', 'friends'
    const dispatch = useDispatch();
    const { socket } = useSelector(store => store.socket);
    const { blockedContacts } = useSelector(store => store.user.authUser || {});
    const [isTyping, setIsTyping] = useState(false);
    
    useEffect(() => {
        if (!socket || !selectedUser?._id) return;
        const handleTyping = ({ senderId }) => {
            if (senderId === selectedUser._id) setIsTyping(true);
        };
        const handleStopTyping = ({ senderId }) => {
            if (senderId === selectedUser._id) setIsTyping(false);
        };
        socket.on('typing', handleTyping);
        socket.on('stopTyping', handleStopTyping);
        return () => {
            socket.off('typing', handleTyping);
            socket.off('stopTyping', handleStopTyping);
        };
    }, [socket, selectedUser?._id]);
    const { refreshFriendData } = useGetFriendRequests();

    // Handle contact block/unfriend events
    useEffect(() => {
        const onBlock = async (e) => {
            const id = e.detail?.userId; if (!id) return;
            try { await axios.post(`${BASE_URL}/api/v1/user/block/${id}`, {}, { withCredentials: true }); toast.success('Contact blocked'); } catch { toast.error('Failed'); }
        };
        const onUnfriend = async (e) => {
            const id = e.detail?.userId; if (!id) return;
            try { await axios.post(`${BASE_URL}/api/v1/user/unfriend/${id}`, {}, { withCredentials: true }); toast.success('Removed from contacts'); } catch { toast.error('Failed'); }
        };
        window.addEventListener('contact:block', onBlock);
        window.addEventListener('contact:unfriend', onUnfriend);
        return () => {
            window.removeEventListener('contact:block', onBlock);
            window.removeEventListener('contact:unfriend', onUnfriend);
        };
    }, []);

    const isOnline = onlineUsers?.includes(selectedUser?._id);
    
    // Determine friendship status whenever selected user changes
    useEffect(() => {
        if (!selectedUser) return;
        
        // Check if they are friends
        const isFriend = friends?.some(id => id.toString() === selectedUser._id);
        if (isFriend) {
            setFriendshipStatus('friends');
            return;
        }
        
        // Check if auth user sent a request to selected user
        const hasSentRequest = sentFriendRequests?.some(id => id.toString() === selectedUser._id);
        if (hasSentRequest) {
            setFriendshipStatus('pending_sent');
            return;
        }
        
        // Check if selected user sent a request to auth user
        const hasReceivedRequest = friendRequests?.some(request => request._id === selectedUser._id);
        if (hasReceivedRequest) {
            setFriendshipStatus('pending_received');
            return;
        }
        
        // Otherwise, they are not friends
        setFriendshipStatus('none');
    }, [selectedUser, friends, sentFriendRequests, friendRequests]);

    const handleBack = () => {
        dispatch(setSelectedUser(null));
    };

    const handleSendFriendRequest = async () => {
        if (!selectedUser) return;
        
        try {
            setIsSending(true);
            const res = await axios.post(
                `${BASE_URL}/api/v1/user/friend-request/${selectedUser._id}`, 
                {}, 
                { withCredentials: true }
            );
            
            // Add the selected user's ID to sentFriendRequests
            dispatch(addSentFriendRequest(selectedUser._id));
            setFriendshipStatus('pending_sent');
            
            // Refresh friend data
            refreshFriendData();
            
            toast.success(res.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Request failed. Try again');
            console.log(error);
        } finally {
            setIsSending(false);
        }
    };

    const handleAcceptRequest = async () => {
        if (!selectedUser) return;
        
        try {
            setIsSending(true);
            const res = await axios.post(
                `${BASE_URL}/api/v1/user/friend-request/${selectedUser._id}/accept`, 
                {}, 
                { withCredentials: true }
            );
            
            setFriendshipStatus('friends');
            
            // Refresh friend data
            refreshFriendData();
            
            toast.success(res.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to accept request');
            console.log(error);
        } finally {
            setIsSending(false);
        }
    };

    const handleDeclineRequest = async () => {
        if (!selectedUser) return;
        
        try {
            setIsSending(true);
            const res = await axios.post(
                `${BASE_URL}/api/v1/user/friend-request/${selectedUser._id}/decline`, 
                {}, 
                { withCredentials: true }
            );
            
            setFriendshipStatus('none');
            
            // Refresh friend data
            refreshFriendData();
            
            toast.success(res.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to decline request');
            console.log(error);
        } finally {
            setIsSending(false);
        }
    };
   
    // Render appropriate friendship buttons based on status
    const renderFriendshipButtons = () => {
        switch (friendshipStatus) {
            case 'none':
                return (
                    <button
                        onClick={handleSendFriendRequest}
                        disabled={isSending}
                        className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isSending ? 'Sending...' : 'Add Friend'}
                    </button>
                );
            case 'pending_sent':
                return (
                    <button
                        disabled
                        className="px-3 py-2 rounded-md text-sm font-medium bg-gray-600 text-gray-300 cursor-not-allowed"
                    >
                        Pending
                    </button>
                );
            case 'pending_received':
                return (
                    <div className="flex gap-2">
                        <button
                            onClick={handleAcceptRequest}
                            disabled={isSending}
                            className="px-3 py-2 rounded-md text-sm font-medium bg-green-600 hover:bg-green-700 text-white"
                        >
                            Accept
                        </button>
                        <button
                            onClick={handleDeclineRequest}
                            disabled={isSending}
                            className="px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white"
                        >
                            Decline
                        </button>
                    </div>
                );
            case 'friends':
                return (
                    <button
                        className="px-3 py-2 rounded-md text-sm font-medium bg-green-600 hover:bg-green-700 text-white flex items-center"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Message
                    </button>
                );
            default:
                return null;
        }
    };

    return (
        <div className='h-screen md:h-full w-full fixed md:relative left-0 top-0 md:inset-auto flex flex-col bg-base-100 rounded-lg'>
            {selectedUser !== null ? (
                <>
                    <header className='flex-none flex items-center justify-between bg-slate-900/60 text-slate-200 px-2 sm:px-3 py-2 sm:py-3 shadow-md backdrop-blur'>
                        <button
                            onClick={handleBack}
                            className='btn btn-ghost btn-circle text-base-content/80 hover:text-base-content mr-1 sm:mr-2'
                            aria-label="Back to users list"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div className={`relative ${isOnline ? 'online' : ''}`}>
                            <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-2 ring-slate-700'>
                                <img
                                    src={getImageUrl(selectedUser?.profilePhoto)}
                                    alt="user-profile"
                                    className='w-full h-full object-cover'
                                />
                            </div>
                            {isOnline && (
                                <span className='badge badge-success badge-xs absolute bottom-0 right-0 transform translate-x-1 translate-y-1'></span>
                            )}
                        </div>
                        <div className='ml-2 sm:ml-4 flex-1 min-w-0'>
                            <div className="flex items-center flex-wrap">
                                <h3 className='font-semibold text-base sm:text-lg truncate'>{selectedUser?.fullName}</h3>
                                <span className="text-xs text-slate-400 ml-1 sm:ml-2 truncate">@{selectedUser?.username}</span>
                            </div>
                            <p className='text-xs sm:text-sm text-slate-400'>
                                {isTyping ? 'typing…' : (isOnline ? 'Online' : 'Offline')}
                            </p>
                        </div>
                        <div className="ml-1 sm:ml-2 flex-shrink-0 flex items-center gap-2">
                            {renderFriendshipButtons()}
                        </div>
                    </header>
                    <main className='flex-1 overflow-hidden relative'>
                        <div className='absolute inset-0 overflow-y-auto'>
                            {Array.isArray(authUser?.blockedContacts) && authUser.blockedContacts.includes(selectedUser?._id) ? (
                                <div className='p-4 text-center text-sm text-base-content/80'>
                                    You have blocked this contact.
                                </div>
                            ) : (
                                <Messages />
                            )}
                        </div>
                    </main>
                    <footer className='flex-none w-full sticky bottom-0 z-50'>
                        <SendInput />
                    </footer>
                </>
            ) : (
                <div className='h-full flex flex-col justify-center items-center bg-base-100 text-base-content p-4'>
                    <h1 className='text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-center'>Welcome, {authUser?.fullName}!</h1>
                    <p className='text-lg md:text-xl lg:text-2xl text-base-content/70 text-center'>
                        Select a conversation to start chatting
                    </p>
                </div>
            )}
        </div>
    )
}

export default MessageContainer