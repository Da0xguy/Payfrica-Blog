import React from 'react';
import { Post, Category } from '../types';
import { authors, categories } from '../data';
import { Eye, ThumbsUp, Calendar, Clock } from 'lucide-react';

interface PostCardProps {
  key?: any;
  post: Post;
  onClick: () => void;
  onCategoryClick: (e: any, slug: string) => void;
  onAuthorClick: (e: any, name: string) => void;
}

export default function PostCard({ post, onClick, onCategoryClick, onAuthorClick }: PostCardProps) {
  // Look up author
  const authorDetail = authors.find(a => a.name === post.author);
  // Look up category
  const categoryDetail = categories.find(c => c.slug === post.category) || {
    name: post.category,
    color: 'bg-gray-100',
    textColor: 'text-gray-700'
  };

  return (
    <article 
      onClick={onClick}
      className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-brand-green/10 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer h-full"
    >
      {/* 16:9 Image container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-50">
        <img
          src={post.coverImage}
          alt={post.title}
          referrerPolicy="no-referrer"
          className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Category Badge overlay */}
        <button
          onClick={(e) => onCategoryClick(e, post.category)}
          className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-transparent shadow-sm hover:scale-105 transition-all cursor-pointer ${categoryDetail.color} ${categoryDetail.textColor}`}
        >
          {categoryDetail.name}
        </button>
      </div>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Date + Read time */}
        <div className="flex items-center space-x-4 text-xs text-gray-400 mb-3 font-mono">
          <span className="flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-gray-300" />
            <span>{post.date}</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-gray-300" />
            <span>{post.readTime}</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-lg text-brand-navy group-hover:text-brand-green-dark transition-colors line-clamp-2 leading-snug mb-3">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed mb-6 flex-1">
          {post.excerpt}
        </p>

        {/* Author & Stats row */}
        <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
          {/* Author info */}
          <button
            onClick={(e) => onAuthorClick(e, post.author)}
            className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity text-left cursor-pointer"
          >
            <img
              src={authorDetail?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80"}
              alt={post.author}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100"
            />
            <div>
              <span className="block text-xs font-semibold text-gray-800 line-clamp-1">{post.author}</span>
              <span className="block text-[10px] text-gray-400 font-medium line-clamp-1">{authorDetail?.role.split(',')[0]}</span>
            </div>
          </button>

          {/* Social Stats indicators */}
          <div className="flex items-center space-x-3 text-[11px] font-mono text-gray-400">
            <span className="flex items-center space-x-1" title="Views">
              <Eye className="w-3.5 h-3.5 text-gray-300" />
              <span>{post.views}</span>
            </span>
            <span className="flex items-center space-x-1" title="Claps">
              <ThumbsUp className="w-3.5 h-3.5 text-gray-300 group-hover:text-brand-green transition-colors" />
              <span>{post.claps}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
