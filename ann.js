{/* <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="pt-20 px-4 space-y-6"
      >
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar className="h-28 w-28">
              <AvatarImage src={profilePhoto} />
              <AvatarFallback className="text-2xl">
                {displayName?.charAt(0) || currentEmail?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <label className={`absolute bottom-0 right-0 bg-[${PURPLE_ACCENT}] text-white rounded-full p-2 cursor-pointer`}>
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
              </label>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                <Spinner />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={!isOwnProfile} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Tell us about yourself..."
              disabled={!isOwnProfile}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input value={currentEmail || ''} disabled className="bg-gray-100" />
          </div>

          {isOwnProfile && (
            <div className="w-full flex items-center justify-center">
            <Button
              onClick={handleSave}
              disabled={loading || !hasChanges}
              size='lg'
              className="bg-white text-purple-900 font-semibold hover:bg-purple-50 shadow-md hover:shadow-lg transform hover:scale-105 transition-transform duration-300 px-10 py-4 rounded-xl"
            >
              {loading ? <Spinner size="h-4 w-4" border="border-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
            </div>
          )}
        </div>
      </motion.div> */}